import RouterGenerator, { generateMenuItems } from './RouterGenerator';
import { AuthGuard, withAuth } from './AuthGuard';
import { routes, Permission } from './routes';
export type { RouteConfig } from './routes';

export {
  RouterGenerator,
  generateMenuItems,
  AuthGuard,
  withAuth,
  routes,
  Permission,
};

// 默认导出路由配置
export default routes;
