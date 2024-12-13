// 获取DOM元素
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const tabBtns = document.querySelectorAll('.tab-btn');

// 当前选中的标签
let currentTab = 'all';

// 从localStorage加载任务
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 保存任务到localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 根据当前标签过滤任务
function getFilteredTasks() {
    let filteredTasks = [];
    switch (currentTab) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        default:
            filteredTasks = [...tasks];
    }
    
    // 将置顶任务排在前面
    return filteredTasks.sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
    });
}

// 渲染任务列表
function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = getFilteredTasks();
    
    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = task.pinned ? 'pinned' : '';
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
            </div>
            <div class="task-bottom">
                <div class="timestamp">
                    ${task.pinned ? '<span class="pin-badge">置顶</span>' : ''}
                    <time>${task.timestamp}</time>
                </div>
                <div class="task-actions">
                    <button class="pin-btn ${task.pinned ? 'pinned' : ''}" title="${task.pinned ? '取消置顶' : '置顶'}">
                        <i class="pin-icon"></i>
                    </button>
                    <button class="edit-btn">修改</button>
                    <button class="delete-btn">删除</button>
                </div>
            </div>
        `;

        // 添加置顶按钮事件处理
        const pinBtn = li.querySelector('.pin-btn');
        pinBtn.addEventListener('click', () => {
            const taskIndex = tasks.findIndex(t => t.text === task.text && t.timestamp === task.timestamp);
            if (taskIndex !== -1) {
                tasks[taskIndex].pinned = !tasks[taskIndex].pinned;
                saveTasks();
                renderTasks();
            }
        });

        // 复选框事件处理
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('change', () => {
            const taskIndex = tasks.findIndex(t => t.text === task.text && t.timestamp === task.timestamp);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = checkbox.checked;
                saveTasks();
                renderTasks();
            }
        });

        // 删除按钮事件处理
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            const taskIndex = tasks.findIndex(t => t.text === task.text && t.timestamp === task.timestamp);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            }
        });

        // 修改按钮事件处理
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const newText = prompt('请输入新的任务内容：', task.text);
            if (newText !== null && newText.trim() !== '') {
                const taskIndex = tasks.findIndex(t => t.text === task.text && t.timestamp === task.timestamp);
                if (taskIndex !== -1) {
                    tasks[taskIndex].text = newText.trim();
                    tasks[taskIndex].timestamp = new Date().toLocaleString();
                    saveTasks();
                    renderTasks();
                }
            }
        });

        taskList.appendChild(li);
    });
}

// 添加任务
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('请输入任务内容！');
        return;
    }

    const task = {
        text: text,
        completed: false,
        timestamp: new Date().toLocaleString(),
        pinned: false  // 添加置顶标志
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

// 标签切换处理
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新活动标签样式
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 更新当前标签并重新渲染
        currentTab = btn.dataset.tab;
        renderTasks();
    });
});

// 添加事件监听器
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 初始化渲染
renderTasks(); 