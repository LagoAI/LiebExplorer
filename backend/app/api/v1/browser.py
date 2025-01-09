"""Browser management API endpoints."""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from loguru import logger

from app.core.browser_manager import BrowserManager
from app.schemas.browser import BrowserResponse, CreateInstanceRequest, VisitUrlRequest
from app.core.browser_manager_instance import get_browser_manager

router = APIRouter()

# 获取浏览器管理器实例
browser_manager = get_browser_manager()

@router.post("/instances", response_model=List[BrowserResponse])
async def create_instances(request: CreateInstanceRequest):
    """创建新的浏览器实例"""
    try:
        instances = []
        for i in range(request.count):
            instance_id = str(len(browser_manager.chrome_processes) + 1)
            success = browser_manager.create_instance(instance_id)
            if success:
                instance = browser_manager.get_instance_info(instance_id)
                if instance:
                    instances.append(instance)
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to get instance info for {instance_id}"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create instance {instance_id}"
                )
        return instances
    except Exception as e:
        logger.error(f"Error creating instances: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/instances", response_model=List[BrowserResponse])
async def get_instances():
    """获取所有浏览器实例"""
    try:
        instances = browser_manager.get_all_instances()
        return list(instances.values())
    except Exception as e:
        logger.error(f"Error getting instances: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/instances/{instance_id}", response_model=BrowserResponse)
async def get_instance(instance_id: str):
    """获取指定浏览器实例的信息"""
    try:
        instance = browser_manager.get_instance_info(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Instance not found")
        return instance
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/instances/{instance_id}")
async def delete_instance(instance_id: str):
    """删除指定的浏览器实例"""
    try:
        success = browser_manager.delete_instance(instance_id)
        if not success:
            raise HTTPException(status_code=404, detail="Instance not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/visit")
async def visit_url(instance_id: str, request: VisitUrlRequest):
    """控制浏览器实例访问指定URL"""
    try:
        success = await browser_manager.visit_url(instance_id, str(request.url))
        if not success:
            raise HTTPException(status_code=404, detail="Instance not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error visiting URL for instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/start", response_model=BrowserResponse)
async def start_instance(instance_id: str):
    """启动浏览器实例"""
    try:
        success = browser_manager.create_instance(instance_id)
        if not success:
            raise HTTPException(status_code=404, detail="Instance not found or cannot be started")
        instance = browser_manager.get_instance_info(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Instance info not found")
        return instance
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/stop")
async def stop_instance(instance_id: str):
    """停止浏览器实例"""
    try:
        success = browser_manager.delete_instance(instance_id)
        if not success:
            raise HTTPException(status_code=404, detail="Instance not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/batch/visit")
async def batch_visit_url(instance_ids: List[str], request: VisitUrlRequest):
    """批量控制多个浏览器实例访问指定URL"""
    if not instance_ids:
        raise HTTPException(status_code=400, detail="No instance IDs provided")

    results = []
    for instance_id in instance_ids:
        try:
            success = await browser_manager.visit_url(instance_id, str(request.url))
            results.append({
                "instance_id": instance_id,
                "success": success
            })
        except Exception as e:
            logger.error(f"Error visiting URL for instance {instance_id}: {str(e)}")
            results.append({
                "instance_id": instance_id,
                "success": False,
                "error": str(e)
            })
    return results

@router.delete("/instances/batch")
async def batch_delete_instances(instance_ids: List[str]):
    """批量删除多个浏览器实例"""
    if not instance_ids:
        raise HTTPException(status_code=400, detail="No instance IDs provided")

    results = []
    for instance_id in instance_ids:
        try:
            success = browser_manager.delete_instance(instance_id)
            results.append({
                "instance_id": instance_id,
                "success": success
            })
        except Exception as e:
            logger.error(f"Error deleting instance {instance_id}: {str(e)}")
            results.append({
                "instance_id": instance_id,
                "success": False,
                "error": str(e)
            })
    return results
