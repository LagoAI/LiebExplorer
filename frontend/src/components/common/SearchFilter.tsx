import React, { useState } from 'react';
import {
  Input,
  Button,
  Card,
  Form,
  Select,
  DatePicker,
  Space,
  Dropdown,
  Divider,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// 过滤项类型定义
export interface FilterOption {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}

// 过滤值类型定义
export interface FilterValue {
  [key: string]: any;
}

interface SearchFilterProps {
  filterOptions: FilterOption[];
  value?: FilterValue;
  onChange?: (values: FilterValue) => void;
  onSearch?: (values: FilterValue) => void;
  loading?: boolean;
  showExpandedSearch?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filterOptions,
  value = {},
  onChange,
  onSearch,
  loading = false,
  showExpandedSearch = false,
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // 处理搜索
  const handleSearch = (values: FilterValue) => {
    // 移除空值
    const cleanValues = Object.entries(values).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {} as FilterValue);

    onSearch?.(cleanValues);
  };

  // 处理过滤器变化
  const handleFilterChange = (key: string, value: any) => {
    const newValues = { ...form.getFieldsValue() };
    
    if (value === undefined || value === null || value === '') {
      delete newValues[key];
      setActiveFilters(activeFilters.filter(k => k !== key));
    } else {
      newValues[key] = value;
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    }

    form.setFieldsValue(newValues);
    onChange?.(newValues);
  };

  // 清除所有过滤器
  const handleClearAll = () => {
    form.resetFields();
    setActiveFilters([]);
    onChange?.({});
  };

  // 清除单个过滤器
  const handleClearFilter = (key: string) => {
    const newValues = { ...form.getFieldsValue() };
    delete newValues[key];
    form.setFieldsValue(newValues);
    setActiveFilters(activeFilters.filter(k => k !== key));
    onChange?.(newValues);
  };

  // 渲染过滤器标签
  const renderFilterTags = () => {
    return activeFilters.map(key => {
      const option = filterOptions.find(opt => opt.key === key);
      if (!option) return null;

      const value = form.getFieldValue(key);
      let label = '';

      switch (option.type) {
        case 'select':
          const selectedOption = option.options?.find(opt => opt.value === value);
          label = selectedOption?.label || value;
          break;
        case 'dateRange':
          if (Array.isArray(value)) {
            label = `${dayjs(value[0]).format('YYYY-MM-DD')} 至 ${dayjs(value[1]).format('YYYY-MM-DD')}`;
          }
          break;
        case 'date':
          label = dayjs(value).format('YYYY-MM-DD');
          break;
        default:
          label = value;
      }

      return (
        <Tag
          key={key}
          closable
          onClose={() => handleClearFilter(key)}
          className="mr-2 mb-2"
        >
          {option.label}: {label}
        </Tag>
      );
    });
  };

  // 渲染过滤器内容
  const renderFilterContent = (option: FilterOption) => {
    switch (option.type) {
      case 'select':
        return (
          <Select
            placeholder={option.placeholder}
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange(option.key, value)}
            options={option.options}
          />
        );
      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange(option.key, value)}
          />
        );
      case 'dateRange':
        return (
          <RangePicker
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange(option.key, value)}
          />
        );
      default:
        return (
          <Input
            placeholder={option.placeholder}
            allowClear
            onChange={(e) => handleFilterChange(option.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Card className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={value}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <Input.Search
              placeholder="搜索..."
              loading={loading}
              onSearch={() => form.submit()}
              allowClear
              className="max-w-md"
            />
          </div>

          {/* 过滤器下拉菜单 */}
          <Dropdown
            menu={{
              items: filterOptions.map(option => ({
                key: option.key,
                label: (
                  <div className="p-2">
                    <div className="font-medium mb-1">{option.label}</div>
                    {renderFilterContent(option)}
                  </div>
                ),
              })),
            }}
            trigger={['click']}
          >
            <Button icon={<FilterOutlined />}>
              过滤 <DownOutlined />
            </Button>
          </Dropdown>

          {/* 清除按钮 */}
          {activeFilters.length > 0 && (
            <Button
              icon={<CloseCircleOutlined />}
              onClick={handleClearAll}
            >
              清除筛选
            </Button>
          )}

          {/* 切换展开搜索 */}
          {showExpandedSearch && (
            <Button
              type="link"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '收起' : '展开'} <DownOutlined rotate={expanded ? 180 : 0} />
            </Button>
          )}
        </div>

        {/* 活动的过滤器标签 */}
        {activeFilters.length > 0 && (
          <div className="mt-4">
            {renderFilterTags()}
          </div>
        )}

        {/* 展开的搜索表单 */}
        {expanded && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {filterOptions.map(option => (
              <Form.Item
                key={option.key}
                name={option.key}
                label={option.label}
              >
                {renderFilterContent(option)}
              </Form.Item>
            ))}
          </div>
        )}
      </Form>
    </Card>
  );
};

export default SearchFilter;
