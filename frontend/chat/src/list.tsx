import { ProDescriptions } from '@ant-design/pro-components';
import { Input, Tooltip, Tag, message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
// 容器状态类型定义
type ContainerStatus = 'running' | 'stopped' | 'restarting' | 'exited';

// 容器信息接口
interface ContainerInfo {
  id: string;
  name: string;
  status: ContainerStatus;
  createdAt: string;
  lastRunAt?: string;
  lastRunAgo?: string;
  description?: string;
  tags?: string[];
}

interface ContainerListProps {
  containers: ContainerInfo[];
  setContainers: (containers: ContainerInfo[]) => void;
}

const ContainerList = ({ containers, setContainers }: ContainerListProps) => {
  const navigate = useNavigate();
  const actionRef = useRef<any>();

  const handleViewAssignment = () => {
    navigate('/');
  };
  
  // 状态枚举定义
  const statusEnum: Record<ContainerStatus, { text: string; color: string }> = {
    running: { text: '运行中', color: 'green' },
    stopped: { text: '已停止', color: 'red' },
    restarting: { text: '重启中', color: 'blue' },
    exited: { text: '已退出', color: 'gray' }
  };
  
  // 计算"上次运行是多久前"
  const calculateTimeAgo = (timestamp?: string) => {
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
  
  // 启动容器
  const startContainer = (id: string) => {
    setContainers(containers.map(container => 
      container.id === id ? { ...container, status: "running" } : container
    ));
    message.success('容器已启动');
  };
  
  // 停止容器
  const stopContainer = (id: string) => {
    setContainers(containers.map(container => 
      container.id === id ? { ...container, status: "stopped" } : container
    ));
    message.success('容器已停止');
  };
  
  // 重启容器
  const restartContainer = (id: string) => {
    setContainers(containers.map(container => 
      container.id === id ? { ...container, status: "restarting" } : container
    ));
    
    // 模拟重启过程
    setTimeout(() => {
      setContainers(containers.map(container => 
        container.id === id ? { ...container, status: "running" } : container
      ));
      message.success('容器已重启');
    }, 2000);
  };
  
  // 删除容器
  const deleteContainer = (id: string) => {
    setContainers(containers.filter(container => container.id !== id));
    message.success('容器已删除');
  };
  
  // 进入容器
  const enterContainer = (id: string) => {
    navigate(`/container/${id}`);
  };
  
  // 更新容器信息
  const updateContainer = (id: string, key: keyof ContainerInfo, value: any) => {
    setContainers(containers.map(container => 
      container.id === id ? { ...container, [key]: value } : container
    ));
    message.success('容器信息已更新');
  };

  return (
    <div className="container-list">
      <div className="list-header">
        <h2>容器列表</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            const newId = `c${containers.length + 1}`;
            const newContainer: ContainerInfo = {
              id: newId,
              name: `新容器 ${containers.length + 1}`,
              status: "stopped",
              createdAt: new Date().toISOString(),
              description: "新创建的容器",
              tags: ["new"]
            };
            
            setContainers([...containers, newContainer]);
            message.success('新容器已添加');
          }}
        >
          添加新容器
        </Button>
      </div>
      
      <div className="containers-grid">
        {containers.map(container => {
          const lastRunAgo = calculateTimeAgo(container.lastRunAt);
          
          return (
            <div key={container.id} className="container-card">
              <ProDescriptions
                actionRef={actionRef}
                column={1}
                title={container.name}
                dataSource={container}
                style={{ background: '#fff', borderRadius: 8, padding: 16 }}
                editable={{
                  onSave: async (keypath, newInfo, originRow) => {
                    // 当保存时更新容器信息
                    updateContainer(container.id, keypath as keyof ContainerInfo, newInfo[keypath]);
                    return true;
                  }
                }}
                extra={
                  <div className="action-buttons">
                    {container.status === 'running' ? (
                      <Button 
                        type="link" 
                        danger
                        onClick={() => stopContainer(container.id)}
                      >
                        停止
                      </Button>
                    ) : (
                      <Button 
                        type="link" 
                        onClick={() => startContainer(container.id)}
                      >
                        启动
                      </Button>
                    )}
                    
                    <Button 
                      type="link" 
                      onClick={handleViewAssignment}
                    >
                      进入
                    </Button>

                    <Button 
                      type="link" 
                      danger
                      onClick={() => deleteContainer(container.id)}
                    >
                      删除
                    </Button>
                  </div>
                }
              >
                <ProDescriptions.Item
                  label="容器ID"
                  dataIndex="id"
                  copyable
                  editable={false}
                />
                
                {/* 可编辑的名称字段 */}
                <ProDescriptions.Item
                  label="名称"
                  dataIndex="name"
                  renderFormItem={() => (
                    <Input 
                      placeholder="输入容器名称" 
                      maxLength={24}
                    />
                  )}
                  render={(text, record, index, action) => (
                    <Tooltip title="点击编辑名称">
                      <div
                        onClick={() => {
                          action?.startEditable('name');
                        }}
                      >
                        {text}
                      </div>
                    </Tooltip>
                  )}
                />
                
                <ProDescriptions.Item
                  label="状态"
                  dataIndex="status"
                  editable={false}
                  render={(text) => (
                    <Tag color={statusEnum[text as ContainerStatus]?.color}>
                      {statusEnum[text as ContainerStatus]?.text}
                    </Tag>
                  )}
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
                  render={() => <Tag color={lastRunAgo === '从未运行' ? 'orange' : 'geekblue'}>{lastRunAgo}</Tag>}
                  editable={false}
                />
                
                {/* 可编辑的描述字段 */}
                <ProDescriptions.Item
                  label="描述"
                  dataIndex="description"
                  renderFormItem={() => (
                    <Input.TextArea 
                      placeholder="输入容器描述"
                      rows={3}
                    />
                  )}
                  render={(text, record, index, action) => (
                    <Tooltip title="点击编辑描述">
                      <div
                        onClick={() => {
                          action?.startEditable('description');
                        }}
                      >
                        {text || <span style={{ color: '#bfbfbf' }}>暂无描述</span>}
                      </div>
                    </Tooltip>
                  )}
                />
                {/** 
                {container.tags && container.tags.length > 0 && (
                  <ProDescriptions.Item
                    label="标签"
                    dataIndex="tags"
                    editable={false}
                    render={(tags) => (
                      <div className="tags-container">
                        {tags.map((tag: string, index: number) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </div>
                    )}
                  />
                )}
                */}
              </ProDescriptions>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContainerList;