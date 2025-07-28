import { useState, useEffect } from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { Input, Tooltip, Tag, message } from 'antd';

const ContainerInfo = ({ containerId }) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // 1. 获取容器信息的API调用
  const fetchContainerData = async () => {
    try {
      // 这里使用你提供的API结构，实际使用时替换为你的API URL
      const response = await fetch(`/api/containers/${containerId}`);
      const result = await response.json();
      
      if (result.success) {
        // 添加上次运行时间计算逻辑
        const lastRunAgo = calculateTimeAgo(result.data.lastRunAt);
        setData({
          ...result.data,
          lastRunAgo // 新增字段：上次运行时间描述
        });
      } else {
        message.error('数据加载失败');
      }
    } catch (err) {
      message.error('网络请求异常');
    } finally {
      setLoading(false);
    }
  };

  // 2. 计算"上次运行是多久前"
  const calculateTimeAgo = (timestamp) => {
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

  // 3. 数据保存处理
  const handleSave = async (key, value) => {
    try {
      // 这里使用你提供的API结构
      const response = await fetch(`/api/containers/${containerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      
      const result = await response.json();
      if (result.success) {
        setData(prev => ({ ...prev, [key]: value }));
        message.success('配置更新成功');
      } else {
        message.error('更新失败');
      }
    } catch (err) {
      message.error('请求异常');
    }
  };

  useEffect(() => {
    if (containerId) fetchContainerData();
  }, [containerId]);

  // 4. 状态枚举定义
  type ContainerStatus = 'running' | 'stopped' | 'restarting' | 'exited';

  const statusEnum: Record<ContainerStatus, { text: string; color: string }> = {
    running: { text: '运行中', color: 'green' },
    stopped: { text: '已停止', color: 'red' },
    restarting: { text: '重启中', color: 'blue' },
    exited: { text: '已退出', color: 'gray' }
  };

  if (loading) return <div>加载容器信息...</div>;
  if (!data) return <div>未获取到数据</div>;

  return (
    <ProDescriptions
      column={1}
      title="容器详情"
      dataSource={data}
      loading={loading}
      editable={{
        onSave: (keypath, value) => handleSave(keypath, value),
      }}
      // 保持原有样式配置
      style={{ background: '#fff', borderRadius: 8, padding: 16 }}
    >
      {/* 容器ID - 不可编辑 */}
      <ProDescriptions.Item
        label="容器ID"
        dataIndex="id"
        copyable
        editable={false}
        render={(id) => <Tooltip title="唯一标识符">{id}</Tooltip>}
      />

      {/* 容器名称 - 可编辑 */}
      <ProDescriptions.Item
        label="名称"
        dataIndex="name"
        renderFormItem={() => (
          <Input placeholder="输入容器名称" maxLength={24} />
        )}
      />
      {/*  状态 - 不可编辑（通过API操作） */}
      <ProDescriptions.Item
        label="状态"
        dataIndex="status"
        render={(text) => (
          <Tag color={statusEnum[text as ContainerStatus]?.color}>
            {statusEnum[text as ContainerStatus]?.text}
          </Tag>
        )}
        editable={false}
      />

      {/* 创建时间 - 不可编辑 */}
      <ProDescriptions.Item
        label="创建时间"
        dataIndex="createdAt"
        valueType="dateTime"
        editable={false}
      />

      {/* 上次运行时间 - 动态计算显示 */}
      <ProDescriptions.Item
        label="上次运行时间"
        dataIndex="lastRunAgo"
        editable={false}
        render={(text) => <Tag color={text === '从未运行' ? 'orange' : 'geekblue'}>{text}</Tag>}
      />

      {/* 操作按钮 */}
      <ProDescriptions.Item
        label="操作"
        valueType="option"
        render={(_, record) => [
          record.status === 'running' ? (
            <a key="stop" onClick={() => console.log('停止容器')}>
              停止
            </a>
          ) : (
            <a key="start" onClick={() => console.log('启动容器')}>
              启动
            </a>
          ),
          <a key="restart" onClick={() => console.log('重启容器')} style={{ marginLeft: 8 }}>
            进入容器
          </a>
        ]}
      />
    </ProDescriptions>
  );
};

export default ContainerInfo;