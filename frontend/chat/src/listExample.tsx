import React, { useState, useEffect } from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { Input, Tooltip, Tag, message } from 'antd';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';

// --------------------------------------------------------------------
// 1. 这是你提供的原始组件代码 (稍作类型优化以确保健壮性)
// --------------------------------------------------------------------
interface ContainerData {
  id: string;
  name: string;
  status: ContainerStatus;
  createdAt: string; // ISO 8601 格式的字符串
  lastRunAt: string | null; // ISO 8601 格式的字符串或 null
  lastRunAgo?: string; // 动态计算的字段
}

type ContainerStatus = 'running' | 'stopped' | 'restarting' | 'exited';

const statusEnum: Record<ContainerStatus, { text: string; color: string }> = {
  running: { text: '运行中', color: 'green' },
  stopped: { text: '已停止', color: 'red' },
  restarting: { text: '重启中', color: 'blue' },
  exited: { text: '已退出', color: 'gray' },
};

interface ContainerInfoProps {
  containerId: string;
}

const ContainerInfo: React.FC<ContainerInfoProps> = ({ containerId }) => {
  const [data, setData] = useState<Partial<ContainerData>>({});
  const [loading, setLoading] = useState(true);

  // API调用 (模拟)
  const fetchContainerData = async (id: string) => {
    setLoading(true);
    // 模拟网络延迟
    await new Promise(res => setTimeout(res, 500)); 
    try {
      // 在实际应用中，这里会是网络请求
      // 我们直接使用下面定义的模拟数据生成函数
      const result = generateMockData(id);
      
      const lastRunAgo = calculateTimeAgo(result.lastRunAt);
      setData({
        ...result,
        lastRunAgo,
      });
    } catch (err) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeAgo = (timestamp: string | null): string => {
    if (!timestamp) return '从未运行';
    
    const now = new Date();
    const lastRun = new Date(timestamp);
    const diffMs = now.getTime() - lastRun.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };

  const handleSave = async (key: string, value: any) => {
    console.log('正在保存...', { key, value });
    message.loading({ content: '正在更新...', key: 'saving' });
    
    // 模拟API调用延迟
    await new Promise(res => setTimeout(res, 700));

    try {
        // 更新本地状态以立即反馈UI
        setData(prev => ({ ...prev, [key]: value }));
        message.success({ content: '配置更新成功!', key: 'saving', duration: 2 });
    } catch (err) {
        message.error({ content: '更新失败!', key: 'saving', duration: 2 });
    }
  };

  useEffect(() => {
    if (containerId) {
      fetchContainerData(containerId);
    }
  }, [containerId]);

  return (
    <ProDescriptions
      column={1}
      title="容器详情"
      dataSource={data}
      loading={loading}
      editable={{
        onSave: async (keypath, record) => {
          await handleSave(keypath as string, record[keypath as keyof typeof record]);
          return true;
        },
      }}
      style={{ background: '#fff', borderRadius: 8, padding: 16 }}
    >
      <ProDescriptions.Item
        dataIndex="id"
        label="容器ID"
        copyable
        editable={false}
        render={(dom) => <Tooltip title="容器的唯一标识符">{dom}</Tooltip>}
      />
      <ProDescriptions.Item
        label="名称"
        dataIndex="name"
        renderFormItem={() => <Input placeholder="请输入容器名称" maxLength={24} />}
      />
      <ProDescriptions.Item
        label="状态"
        dataIndex="status"
        editable={false}
        render={(text) => {
          const statusKey = text as ContainerStatus;
          if (statusEnum[statusKey]) {
            return (
              <Tag color={statusEnum[statusKey].color}>
                {statusEnum[statusKey].text}
              </Tag>
            );
          }
          return <Tag>未知状态</Tag>;
        }}
      />
      <ProDescriptions.Item
        label="创建时间"
        dataIndex="createdAt"
        valueType="dateTime"
        editable={false}
      />
      <ProDescriptions.Item
        label="上次运行时间"
        dataIndex="lastRunAgo"
        editable={false}
        render={(text) => (
          <Tag color={text === '从未运行' ? 'orange' : 'geekblue'}>{text}</Tag>
        )}
      />
      <ProDescriptions.Item
        label="操作"
        valueType="option"
        render={(_, record) => [
          record.status === 'running' ? (
            <a key="stop" onClick={() => message.info('模拟操作：停止容器')}>
              停止
            </a>
          ) : (
            <a key="start" onClick={() => message.info('模拟操作：启动容器')}>
              启动
            </a>
          ),
          <a key="restart" onClick={() => message.info('模拟操作：进入容器')} style={{ marginLeft: 8 }}>
            进入容器
          </a>,
           <a key="delete" onClick={() => message.warn('模拟操作：删除容器')} style={{ marginLeft: 8, color: 'red' }}>
            删除
          </a>
        ]}
      />
    </ProDescriptions>
  );
};

// --------------------------------------------------------------------
// 2. 这是用于生成随机数据的辅助函数
// --------------------------------------------------------------------

/**
 * 生成随机的容器模拟数据
 * @param id 指定的容器ID
 * @returns {ContainerData} 完整的容器数据对象
 */
const generateMockData = (id: string): ContainerData => {
  const statuses: ContainerStatus[] = ['running', 'stopped', 'restarting', 'exited'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const now = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30);
  const createdAt = new Date(now.setDate(now.getDate() - randomDaysAgo)).toISOString();

  let lastRunAt: string | null;
  // 如果从未运行过 (10%的几率)
  if (Math.random() < 0.1) {
    lastRunAt = null;
  } else {
    const randomMinutesAgo = Math.floor(Math.random() * 24 * 60 * 5); // 5天内的任意分钟
    lastRunAt = new Date(Date.now() - randomMinutesAgo * 60 * 1000).toISOString();
  }
  
  const randomName = `container-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    name: randomName,
    status: randomStatus,
    createdAt,
    lastRunAt,
  };
};


// --------------------------------------------------------------------
// 3. 这是最终导出的、带有特定ID和模拟数据的组件
//    你可以直接在你的应用中使用 <MockedContainerInfo />
// --------------------------------------------------------------------
export const MockedContainerInfo = () => {
  // 直接调用你的原始组件，并传入你指定的ID
  return <ContainerInfo containerId="0000000" />;
};

// 你也可以默认导出它，方便直接引用
export default MockedContainerInfo;