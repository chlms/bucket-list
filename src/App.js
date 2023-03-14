import React, {useState} from 'react';
import styled, {ThemeProvider} from 'styled-components/native';
import {theme} from './theme';
import {StatusBar, Dimensions} from 'react-native';
import Input from './components/Input';
import {images} from './images';
import IconButton from './components/IconButton';
import Task from './components/Task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';

//배경화면
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme})=>theme.background};
  align-items: center;
  justify-content: flex-start;  
`;

//제목
const Title = styled.Text`
  width: 89%;
  height: 60px;
  margin: 3px 0;
  padding: 15px 20px;
  border-radius: 10px;
  background-color: ${({theme})=>theme.itemBackground};
  font-size: 25px;
  color: ${({theme})=>theme.text};
  font-weight: 500;
  text-align: center;
`;

const List = styled.ScrollView`
  flex: 1;
  width: ${({width})=>width-40}px;
`;

export default function App() {
  const width = Dimensions.get('window').width;

  const [isReady, setIsReady] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState({
    '1': {id: '1', text: '도서 1000권 읽기', completed: true},
    '2': {id: '2', text: '세계여행', completed: true}
  });

  const _saveTasks = async tasks => {
    try{
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      setTasks(tasks);
    }catch(e){
      console.log.error(e);
    }
  };

  const _loadTasks = async () => {
    const loadedTasks = await AsyncStorage.getItem('tasks');
    setTasks(JSON.parse(loadedTasks || '{}'));
  };

  const _addTask = () => {
    const ID = Date.now().toString();
    const newTaskObject = {
      [ID]: {id: ID, text: newTask, completed: false},
    };
    setNewTask('');
    _saveTasks({...tasks, ...newTaskObject});
  };

  const _deleteTask = id => {
    const currentTasks = Object.assign({},tasks);
    delete currentTasks[id];
    _saveTasks(currentTasks);
  };

  const _toggleTask = id => {
    const currentTasks = Object.assign({}, tasks);
    currentTasks[id]['completed'] = !currentTasks[id]['completed'];
    _saveTasks(currentTasks);
  };

  const _updateTask = item => {
    const currentTasks = Object.assign({}, tasks);
    currentTasks[item.id] = item;
    _saveTasks(currentTasks);
  };

  const _handleTextChange = text => {
    setNewTask(text);
  };

  const _onBlur = () => {
    setNewTask('');
  }
  
  return isReady ? (
    <ThemeProvider theme={theme}>
      <Container>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.bacground}
          />
        <Title>버킷 리스트</Title>
        <Input 
        placeholder="+항목추가"
        value={newTask}
        onChangeText={_handleTextChange}
        onSubmitEditing={_addTask}
        onBlur={_onBlur}
        />
        <List width={width}>
            {Object.values(tasks)
              .reverse()
              .map(item=>(
                <Task 
                key={item.id} 
                item={item} 
                deleteTask={_deleteTask}
                toggleTask={_toggleTask}
                updateTask={_updateTask}
                />
              ))}
        </List>
      </Container>
    </ThemeProvider>
  ) : (
    <AppLoading
    startAsync={_loadTasks}
    onFinish={()=>setIsReady(true)}
    onError={console.error}
    />
  );
}


