import { useState } from 'react';
import { Layout, Button, Card, Avatar, Menu, Dropdown, Input, Progress, Tag } from 'antd';
import { 
  PlusOutlined, SettingOutlined, SearchOutlined, 
  CheckCircleFilled, ClockCircleFilled, ExperimentFilled,
  ContainerFilled, PlayCircleFilled, BookFilled,
  CodeFilled, DatabaseFilled, CalendarOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import './codelab.css';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const CodeLab = () => {
  const [activeButton, setActiveButton] = useState('assignments');
  const navigate = useNavigate();
  
  // 提升状态到顶级组件
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "React Component Architecture",
      rating: "4.8",
      level: "Intermediate",
      tags: ["React", "TypeScript", "Components"],
      description: "Build a scalable component system with TypeScript and modern React patterns",
      duration: "2-3 hours",
      dueDate: "2024-01-15",
      progress: 100
    },
    {
      id: 2,
      title: "API Design with Node.js",
      rating: "4.6",
      level: "Advanced",
      tags: ["Node.js", "JavaScript", "Open API"],
      description: "Learn how to design robust and scalable APIs using Node.js",
      duration: "3-4 hours",
      dueDate: "2024-01-20",
      progress: 50
    },
    {
      id: 3,
      title: "CSS Grid Mastery",
      rating: "4.9",
      level: "Beginner",
      tags: ["CSS", "Layout", "Grid"],
      description: "Master CSS Grid layout system through practical exercises and real-world examples",
      duration: "1-2 hours",
      dueDate: "2024-01-10",
      progress: 89
    }
  ]);
  
  // 在顶级组件中定义 addNewCard 函数
  const addNewCard = () => {
    const newCard = {
      id: Math.max(...courses.map(c => c.id), 0) + 1,
      title: `New Course ${courses.length + 1}`,
      rating: "4.0",
      level: "Beginner",
      tags: ["New", "Course"],
      description: "This is a newly added course card",
      duration: "1-2 hours",
      dueDate: "2024-02-01",
      progress: 0
    };
    
    setCourses([...courses, newCard]);
  };
  
  const handleViewAssignment = () => {
    navigate('/');
  };
  
  const handleSearch = (value) => {
    alert(value);
  };

  // 顶部导航栏组件
  const AppHeader = () => (
    <Header className="codelab-header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-blue-box"></div>
          <span className="logo-text">EduCode</span>
        </div>
      </div>
      
      <div className="header-right">
        <Button type="primary" icon={<PlusOutlined />} onClick={addNewCard}>
          New Container
        </Button>
        <Dropdown overlay={settingsMenu} trigger={['click']}>
          <Button className="icon-button" icon={<SettingOutlined />} />
        </Dropdown>
        <Avatar className="user-avatar" size="default">J</Avatar>
      </div>
    </Header>
  );

  // 设置菜单
  const settingsMenu = (
    <Menu>
      <Menu.Item key="1">Profile Settings</Menu.Item>
      <Menu.Item key="2">Account Preferences</Menu.Item>
      <Menu.Item key="3">Notification Settings</Menu.Item>
    </Menu>
  );
  
  // 五个数据卡片组件
  const StatsCards = () => (
    <div className="stats-cards">
      <div className="five-column-grid">
        <Card className="stat-card">
          <div className="card-content">
            <div className="stat-text">
              <div className="label">Completed</div>
              <div className="value">12</div>
            </div>
            <div className="icon-wrapper">
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: '24px' }} />
            </div>
            </div>
        </Card>
        
        <Card className="stat-card">
          <div className="card-content">
            <div className="stat-text">
              <div className="label">Experiments</div>
              <div className="value">8</div>
            </div>
            <div className="icon-wrapper">
              <ExperimentFilled style={{ color: '#1890ff', fontSize: '24px' }} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="card-content">
            <div className="stat-text">
              <div className="label">Containers</div>
              <div className="value">3</div>
            </div>
            <div className="icon-wrapper">
              <ContainerFilled style={{ color: '#722ed1', fontSize: '24px' }} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="card-content">
            <div className="stat-text">
              <div className="label">Running</div>
              <div className="value">2</div>
            </div>
            <div className="icon-wrapper">
              <PlayCircleFilled style={{ color: '#faad14', fontSize: '24px' }} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="card-content">
            <div className="stat-text">
              <div className="label">Active</div>
              <div className="value">5</div>
            </div>
            <div className="icon-wrapper">
              <ClockCircleOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  // 功能区按钮组件
  const FunctionAndSearchArea = () => (
    <div className="function-and-search-area">
      <div className="function-buttons">
        <Button
          type={activeButton === 'assignments' ? 'primary' : 'default'}
          onClick={() => setActiveButton('assignments')}
          icon={<BookFilled />}
        >
          Assignments
        </Button>
        <Button
          type={activeButton === 'experiments' ? 'primary' : 'default'}
          onClick={() => setActiveButton('experiments')}
          icon={<ExperimentFilled />}
        >
          My Experiments
        </Button>
        <Button
          type={activeButton === 'containers' ? 'primary' : 'default'}
          onClick={() => setActiveButton('containers')}
          icon={<ContainerFilled />}
        >
          Containers
        </Button>
      </div>
      
      <div className="search-filter-container">
        <Input.Search
          placeholder="Search..."
          prefix={<SearchOutlined />}
          className="search-input"
          onSearch={handleSearch}
        />
        <Button className="filter-button">
          Filter
        </Button>
      </div>
    </div>
  );
  
  // 课程卡片组件
  const CourseCard = ({ title, rating, level, tags, description, duration, dueDate, progress }) => (
    <Card className="course-card">
      <div className="course-header">
        <div className="course-title">{title}</div>
        <div className="course-rating">{rating}</div>
      </div>
      
      <div className="course-level">
        <Tag color={level === 'Intermediate' ? '#2db7f5' : level === 'Advanced' ? '#f50' : '#87d068'}>
          {level}
        </Tag>
      </div>
      
      <div className="course-tags">
        {tags.map((tag, index) => (
          <Tag key={index} className="course-tag">{tag}</Tag>
        ))}
      </div>
      
      <p className="course-description">{description}</p>
      
      <div className="course-footer">
        <div className="course-info">
          <div className="duration">
            <ClockCircleFilled style={{ marginRight: '5px' }} />
            {duration}
          </div>
          <div className="due-date">
            <CalendarOutlined style={{ marginRight: '5px' }} />
            Due {dueDate}
          </div>
        </div>
        
        {progress && (
          <div className="progress-container">
            <div className="progress-text">Progress: {progress}%</div>
            <Progress percent={progress} size="small" status="active" />
          </div>
        )}
        
        <div className="action-buttons">
          <Button 
            type="link" 
            className="action-button" 
            onClick={handleViewAssignment}
          >
            {progress === 100 ? 'Review' : progress ? 'View Assignment' : 'Start Coding'}
          </Button>
          <Button type="link" icon={progress ? <CodeFilled /> : <DatabaseFilled />} onClick={handleViewAssignment}/>
        </div>
      </div>
    </Card>
  );
  
  // 课程卡片容器组件
  const CourseCardsContainer = () => {
    return (
      <div className="course-cards-container">
        <div className="course-grid">
          {courses
            .sort((a, b) => a.id - b.id)
            .map(course => (
              <CourseCard
                key={course.id}
                title={course.title}
                rating={course.rating}
                level={course.level}
                tags={course.tags}
                description={course.description}
                duration={course.duration}
                dueDate={course.dueDate}
                progress={course.progress}
              />
            ))}
        </div>
        
        <div className="add-card-button-container">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={addNewCard}
            className="add-card-button"
          >
            Add New Card
          </Button>
        </div>
      </div>
    );
  };

  // 主体内容区域
  return (
    <Layout className="codelab-layout">
      <AppHeader />
      
      <Content className="codelab-content">
        <div className="welcome-section">
          <h1>Welcome back, John!</h1>
          <p>Manage your assignments, experiments, and development environments.</p>
        </div>
        
        <StatsCards />
        
        <FunctionAndSearchArea />
        
        <CourseCardsContainer />
      </Content>
    </Layout>
  );
};

export default CodeLab;