import {
    AppstoreAddOutlined,
    CloseOutlined,
    CloudUploadOutlined,
    CommentOutlined,
    CopyOutlined,
    DislikeOutlined,
    LikeOutlined,
    OpenAIFilled,
    PaperClipOutlined,
    PlusOutlined,
    ProductOutlined,
    ReloadOutlined,
    ScheduleOutlined,
  } from '@ant-design/icons';
  import {
    Attachments,
    type AttachmentsProps,
    Bubble,
    Conversations,
    Prompts,
    Sender,
    Suggestion,
    Welcome,
    useXAgent,
    useXChat,
  } from '@ant-design/x';
  import type { Conversation } from '@ant-design/x/es/conversations';
  import { Button, Popover, Space, Spin, message } from 'antd';//Image
  import type { GetProp, GetRef } from 'antd/lib'; // 单独导入类型
  import { createStyles } from 'antd-style';
  import dayjs from 'dayjs';
  import  { useEffect, useRef, useState } from 'react';//React
  
  type BubbleDataType = {
    role: string;
    content: string;
  };
  
  const MOCK_SESSION_LIST = [
    {
      key: '5',
      label: 'New session',
      group: 'Today',
    },
    {
      key: '4',
      label: 'What has Ant Design X upgraded?',
      group: 'Today',
    },
    {
      key: '3',
      label: 'New AGI Hybrid Interface',
      group: 'Today',
    },
    {
      key: '2',
      label: 'How to quickly install and import components?',
      group: 'Yesterday',
    },
    {
      key: '1',
      label: 'What is Ant Design X?',
      group: 'Yesterday',
    },
  ];
  const MOCK_SUGGESTIONS = [
    { label: 'Write a report', value: 'report' },
    { label: 'Draw a picture', value: 'draw' },
    {
      label: 'Check some knowledge',
      value: 'knowledge',
      icon: <OpenAIFilled />,
      children: [
        { label: 'About React', value: 'react' },
        { label: 'About Ant Design', value: 'antd' },
      ],
    },
  ];
  const MOCK_QUESTIONS = [
    'What has Ant Design X upgraded?',
    'What components are in Ant Design X?',
    'How to quickly install and import components?',
  ];
  const AGENT_PLACEHOLDER = 'Generating content, please wait...';
  
  //创建样式的一个hook：useCopilotStyle
  const useCopilotStyle = createStyles(({ token, css }) => {
    return {
      copilotChat: css`
        display: flex;
        flex-direction: column;
        background: ${token.colorBgContainer};
        color: ${token.colorText};
      `,
      // chatHeader 样式
      chatHeader: css`
        height: 52px;
        box-sizing: border-box;
        border-bottom: 1px solid ${token.colorBorder};
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px 0 16px;
      `,
      headerTitle: css`
        font-weight: 600;
        font-size: 15px;
      `,
      headerButton: css`
        font-size: 18px;
      `,
      conversations: css`
        width: 300px;
        .ant-conversations-list {
          padding-inline-start: 0;
        }
      `,
      // chatList 样式
      chatList: css`
        overflow: auto;
        padding-block: 16px;
        flex: 1;
      `,
      chatWelcome: css`
        margin-inline: 16px;
        padding: 12px 16px;
        border-radius: 2px 12px 12px 12px;
        background: ${token.colorBgTextHover};
        margin-bottom: 16px;
      `,
      loadingMessage: css`
        background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
        background-size: 100% 2px;
        background-repeat: no-repeat;
        background-position: bottom;
      `,
      // chatSend 样式
      chatSend: css`
        padding: 12px;
      `,
      sendAction: css`
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
      `,
      speechButton: css`
        font-size: 18px;
        color: ${token.colorText} !important;
      `,
    };
  });
  
  interface CopilotProps {
    copilotOpen: boolean;
    setCopilotOpen: (open: boolean) => void;
  }
  
  const Copilot = (props: CopilotProps) => {
    const { copilotOpen, setCopilotOpen } = props;//等价于const copilotOpen = props.copilotOpen
    const { styles } = useCopilotStyle();//调用hook并解构出styles对象
    const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);//创建一个用于访问attachments组件的实例方法或dom节点的ref；attachments组件：用于文件上传；
    const abortController = useRef<AbortController>(null);//用来创建可中断异步任务的控制器（！）；useref:创建持久化的引用对象；<abortcontroller>：指定引用存储的是abortcontroller类型的对象
  
    // ==================== State ====================
  
    const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});
  
    const [sessionList, setSessionList] = useState<Conversation[]>(MOCK_SESSION_LIST);
    const [curSession, setCurSession] = useState(sessionList[0].key);
  
    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);
  
    const [inputValue, setInputValue] = useState('');
  
    /**
     * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
     */
  
    // ==================== Runtime ====================
    // 这里是调用模型部分
    const [agent] = useXAgent<BubbleDataType>({
      baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
      model: 'DeepSeek-R1-Distill-Qwen-7B',
      dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
    });
  
    const loading = agent.isRequesting();
  
    const { messages, onRequest, setMessages } = useXChat({
      agent,//前面已经写过agent的配置
      requestFallback: (_, { error }) => {//错误处理
        if (error.name === 'AbortError') {
          return {
            content: 'Request is aborted',//请求中断
            role: 'assistant',
          };
        }
        return {
          content: 'Request failed, please try again!',//请求失败
          role: 'assistant',
        };
      },
      transformMessage: (info) => {
        const { originMessage, chunk } = info || {};//把用户输入的消息和ai刚刚返回的数据片段转化成数据；如果info为空或未定义，则返回空对象{}
        let currentContent = '';
        let currentThink = '';
        try {
          if (chunk?.data && !chunk?.data.includes('DONE')) {//检验数据有没有data字段，以及流式传输是否未完结
            const message = JSON.parse(chunk?.data);//把AI返回的字符串数据转换成js对象
            currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';//AI的推理过程；message.choices[0]：取第一条回复；.delta.reasoning_content：取推理过程
            currentContent = message?.choices?.[0]?.delta?.content || '';//AI的实际回复内容
            /*举例返回数据
            {
              "choices": [{
                "delta": {
                  "reasoning_content": "用户问天气，需要查询地理位置",
                  "content": "今天北京晴转多云"
                }
              }]
            }*/
          }
        } catch (error) {
          console.error(error);
        }
  
        let content = '';
  
        if (!originMessage?.content && currentThink) {//originMessage为空，即当前是AI的第一条消息；且AI有思考过程
          content = `<think>${currentThink}`;//添加<think>作为AI正在思考的标签
        } else if (//已经发送了思考过程，但还没发送正式内容，在正式内容前加</think>
          originMessage?.content?.includes('<think>') &&
          !originMessage?.content.includes('</think>') &&
          currentContent
        ) {
          content = `${originMessage?.content}</think>${currentContent}`;
        } else {//发送了思考和正式内容，直接拼接（已经有<think>和</think>标签了
          content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
        }
  
        return {//最终返回
          content: content,
          role: 'assistant',
        };
      },
      resolveAbortController: (controller) => {//绑定中断控制器
        abortController.current = controller;
      },
    });
  
    // ==================== Event ====================
    const handleUserSubmit = (val: string) => {//当发送时，该函数会被调用
      onRequest({//发送请求
        stream: true,
        message: { content: val, role: 'user' },
      });
  
      // session title mock修改标题
      if (sessionList.find((i) => i.key === curSession)?.label === 'New session') {//如果标题还是默认的，那么
        setSessionList(
          sessionList.map((i) => (i.key !== curSession ? i : { ...i, label: val?.slice(0, 20) })),//修改为第一条消息的前二十个字
        );
      }
    };
  
    const onPasteFile = (_: File, files: FileList) => {//当用户把文件粘贴到聊天窗口时触发
      for (const file of files) {//遍历所有文件
        attachmentsRef.current?.upload(file);//用attachmentsRef.upload(）上传
      }
      setAttachmentsOpen(true);
    };
  
    // ==================== Nodes ====================
    const chatHeader = (//聊天栏的顶栏
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>✨ AI Copilot</div>
        <Space size={0}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => {
              if (agent.isRequesting()) {
                message.error(
                  'Message is Requesting, you can create a new conversation after request done or abort it right now...',
                );
                return;
              }
  
              if (messages?.length) {
                const timeNow = dayjs().valueOf().toString();//生成会话时间
                abortController.current?.abort();
                // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                // In future versions, the sessionId capability will be added to resolve this problem.
                setTimeout(() => {
                  setSessionList([
                    { key: timeNow, label: 'New session', group: 'Today' },
                    ...sessionList,
                  ]);
                  setCurSession(timeNow);
                  setMessages([]);
                }, 100);
              } else {
                message.error('It is now a new conversation.');
              }
            }}
            className={styles.headerButton}
          />
          {/**历史会话列表 */}
          <Popover
            placement="bottom"//在下方弹出
            styles={{ body: { padding: 0, maxHeight: 600 } }}//弹出框样式
            content={
              <Conversations
                items={sessionList?.map((i) =>
                  i.key === curSession ? { ...i, label: `[current] ${i.label}` } : i,
                )}//会话列表数据；  ...i：展开运算符，复制原对象所有属性；如果某个会话是当前会话则把labal变成[current]+label
                activeKey={curSession}//当前选中会话
                groupable//允许按分组显示（按group字段分组显示，比如:"今天，昨天"
                onActiveChange={async (val) => {
                  abortController.current?.abort();//取消当前请求
                  // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                  // In future versions, the sessionId capability will be added to resolve this problem.
                  setTimeout(() => {//延迟100ms
                    setCurSession(val);//更新当前会话
                    setMessages(messageHistory?.[val] || []);//加载历史消息
                  }, 100);
                }}
                styles={{ item: { padding: '0 8px' } }}
                className={styles.conversations}
              />
            }
          >
            <Button type="text" icon={<CommentOutlined />} className={styles.headerButton} />
          </Popover>
          {/**关闭聊天框的按钮 */}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setCopilotOpen(false)}
            className={styles.headerButton}
          />
        </Space>
      </div>
    );
    const chatList = (
      <div className={styles.chatList}>
        {/**有message且message有长度->有历史消息则展示消息列表，没有则展示欢迎界面（三元运算符决定渲染内容） */}
        {messages?.length ? (
          /** 消息列表 */
          <Bubble.List
            style={{ height: '100%', paddingInline: 16 }}
            items={messages?.map((i) => ({
              ...i.message,
              classNames: {
                content: i.status === 'loading' ? styles.loadingMessage : '',
              },
              typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,//suffix：动画后缀效果
            }))}
            roles={{
              assistant: {
                placement: 'start',//左侧对其
                footer: (//底部附加 操作按钮组
                  <div style={{ display: 'flex' }}>
                    <Button type="text" size="small" icon={<ReloadOutlined />} />
                    <Button type="text" size="small" icon={<CopyOutlined />} />
                    <Button type="text" size="small" icon={<LikeOutlined />} />
                    <Button type="text" size="small" icon={<DislikeOutlined />} />
                  </div>
                ),
                loadingRender: () => (//加载状态UI
                  <Space>
                    <Spin size="small" />
                    {AGENT_PLACEHOLDER}
                  </Space>
                ),
              },
              user: { placement: 'end' },
            }}
          />
        ) : (
          /** 没有消息时的 welcome */
          <>
            <Welcome
              variant="borderless"//样式变体（default,card...)
              title="👋 你好，这里是Educode"
              description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
              className={styles.chatWelcome}
            />
  
            <Prompts
              vertical
              title="I can help："
              items={MOCK_QUESTIONS.map((i) => ({ key: i, description: i }))}//预设问题列表
              onItemClick={(info) => handleUserSubmit(info?.data?.description as string)}//点击问题后，将问题的文本作为用户输入提交
              style={{
                marginInline: 16,
              }}
              styles={{
                title: { fontSize: 14 },
              }}
            />
          </>
        )}
      </div>
    );
    const sendHeader = (
      <Sender.Header
        title="Upload File"
        styles={{ content: { padding: 0 } }}
        open={attachmentsOpen}
        onOpenChange={setAttachmentsOpen}
        forceRender
      >
        <Attachments
          ref={attachmentsRef}
          beforeUpload={() => false}
          items={files}
          onChange={({ fileList }) => setFiles(fileList)}
          placeholder={(type) =>
            type === 'drop'
              ? { title: 'Drop file here' }
              : {
                  icon: <CloudUploadOutlined />,
                  title: 'Upload files',
                  description: 'Click or drag files to this area to upload',
                }
          }
        />
      </Sender.Header>
    );
    const chatSender = (
      <div className={styles.chatSend}>
        <div className={styles.sendAction}>
          <Button
            icon={<ScheduleOutlined />}
            onClick={() => handleUserSubmit('What has Ant Design X upgraded?')}
          >
            Upgrades
          </Button>
          <Button
            icon={<ProductOutlined />}
            onClick={() => handleUserSubmit('What component assets are available in Ant Design X?')}
          >
            Components
          </Button>
          <Button icon={<AppstoreAddOutlined />}>More</Button>
        </div>
  
        {/** 输入框 */}
        <Suggestion items={MOCK_SUGGESTIONS} onSelect={(itemVal) => setInputValue(`[${itemVal}]:`)}>
          {({ onTrigger, onKeyDown }) => (
            <Sender
              loading={loading}
              value={inputValue}
              onChange={(v) => {
                onTrigger(v === '/');
                setInputValue(v);
              }}
              onSubmit={() => {
                handleUserSubmit(inputValue);
                setInputValue('');
              }}
              onCancel={() => {
                abortController.current?.abort();
              }}
              allowSpeech
              placeholder="Ask or input / use skills"
              onKeyDown={onKeyDown}
              header={sendHeader}
              prefix={
                <Button
                  type="text"
                  icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                />
              }
              onPasteFile={onPasteFile}
              actions={(_, info) => {
                const { SendButton, LoadingButton, SpeechButton } = info.components;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SpeechButton className={styles.speechButton} />
                    {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                  </div>
                );
              }}
            />
          )}
        </Suggestion>
      </div>
    );
  
    useEffect(() => {
      // history mock
      if (messages?.length) {
        setMessageHistory((prev) => ({
          ...prev,
          [curSession]: messages,
        }));
      }
    }, [messages]);
  
    return (
      <div className={styles.copilotChat} style={{ width: copilotOpen ? 400 : 0 }}>
        {/** 对话区 - header */}
        {chatHeader}
  
        {/** 对话区 - 消息列表 */}
        {chatList}
  
        {/** 对话区 - 输入框 */}
        {chatSender}
      </div>
    );
  };
  
  const useWorkareaStyle = createStyles(({ token, css }) => {
    return {
      copilotWrapper: css`
        min-width: 1000px;
        height: 100vh;
        display: flex;
      `,
      workarea: css`
        flex: 1;
        background: ${token.colorBgLayout};
        display: flex;
        flex-direction: column;
      `,
      workareaHeader: css`
        box-sizing: border-box;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 48px 0 28px;
        border-bottom: 1px solid ${token.colorBorder};
      `,
      headerTitle: css`
        font-weight: 600;
        font-size: 15px;
        color: ${token.colorText};
        display: flex;
        align-items: center;
        gap: 8px;
      `,
      headerButton: css`
        background-image: linear-gradient(78deg, #8054f2 7%, #3895da 95%);
        border-radius: 12px;
        height: 24px;
        width: 93px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s;
        &:hover {
          opacity: 0.8;
        }
      `,
      workareaBody: css`
        flex: 1;
        padding: 16px;
        background: ${token.colorBgContainer};
        border-radius: 16px;
        min-height: 0;
      `,
      bodyContent: css`
        overflow: auto;
        height: 100%;
        padding-right: 10px;
      `,
      bodyText: css`
        color: ${token.colorText};
        padding: 8px;
      `,
    };
  });
  
  const CopilotDemo = () => {
    const { styles: workareaStyles } = useWorkareaStyle();
  
    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(true);
  
    // ==================== Render =================
    return (
      <div className={workareaStyles.copilotWrapper}>
        {/** 左侧工作区 */}
        {/** 后面直接替换成workspace即可 */}
        <div className={workareaStyles.workarea}>
          <div className={workareaStyles.workareaHeader}>
            {/**这里是顶栏 包含*/}
            <div className={workareaStyles.headerTitle}>
              {/**ant-dedign-x的logo 到时候换成educode自己的logo*/}
              <img
                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                draggable={false}
                alt="logo"
                width={20}
                height={20}
              />
              Ant Design X
            </div>
            {/**展开copilot的按钮 setCopilotOpen（true):展开侧边栏*/} 
            {!copilotOpen && (
              <div onClick={() => setCopilotOpen(true)} className={workareaStyles.headerButton}>
                ✨ AI Copilot
              </div>
            )}
          </div>
          
          {/**这里是主体 */} {/**如果打开了侧边栏，则上下左右页边距16px；否则上下16px,左右48px*/}
          <div
            className={workareaStyles.workareaBody}
            style={{ margin: copilotOpen ? 16 : '16px 48px' }}
          >
            <div className={workareaStyles.bodyContent}>
              {/**主界面目前的展示图 将来在这里接codeserver页面 */}
              <iframe
                src="http://172.16.4.89:8080"
                height="100%"
                width="100%"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                allow="clipboard-read;clipboard-write"
                referrerPolicy="same-origin"
                loading="eager"
                allow-downloads>
              </iframe>
              {/**这段文字可以直接删除 
              <div className={workareaStyles.bodyText}>
                <h4>What is the RICH design paradigm?</h4>
                <div>
                  RICH is an AI interface design paradigm we propose, similar to how the WIMP paradigm
                  relates to graphical user interfaces.
                </div>
                <br />
                <div>
                  The ACM SIGCHI 2005 (the premier conference on human-computer interaction) defined
                  that the core issues of human-computer interaction can be divided into three levels:
                </div>
                <ul>
                  <li>
                    Interface Paradigm Layer: Defines the design elements of human-computer
                    interaction interfaces, guiding designers to focus on core issues.
                  </li>
                  <li>
                    User model layer: Build an interface experience evaluation model to measure the
                    quality of the interface experience.
                  </li>
                  <li>
                    Software framework layer: The underlying support algorithms and data structures
                    for human-computer interfaces, which are the contents hidden behind the front-end
                    interface.
                  </li>
                </ul>
                <div>
                  The interface paradigm is the aspect that designers need to focus on and define the
                  most when a new human-computer interaction technology is born. The interface
                  paradigm defines the design elements that designers should pay attention to, and
                  based on this, it is possible to determine what constitutes good design and how to
                  achieve it.
                </div>
              </div>*/}
            </div>
          </div>
        </div>
  
        {/** 右侧对话区 */}
        <Copilot copilotOpen={copilotOpen} setCopilotOpen={setCopilotOpen} />
      </div>
    );
  };
  
  export default CopilotDemo;