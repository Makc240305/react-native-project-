import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const TaskListScreen = ({ navigation }) => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), snapshot => {
      setTasks(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    });
    return unsubscribe;
  }, []);

  const addTask = async () => {
    if (!task.trim()) return;
    try {
      await addDoc(collection(db, "tasks"), { text: task.trim(), description: '', done: false });
      setTask('');
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleTaskCompletion = async (id, done) => {
    try {
      await updateDoc(doc(db, "tasks", id), { done: !done });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'completed' ? task.done :
    filter === 'incomplete' ? !task.done : true
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Manager</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        {['all', 'completed', 'incomplete'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilterButton]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterButtonText, filter === f && styles.activeFilterButtonText]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              style={[styles.checkbox, item.done && styles.checkedCheckbox]}
              onPress={() => toggleTaskCompletion(item.id, item.done)}
            />
            <TouchableOpacity
              style={styles.taskContent}
              onPress={() => navigation.navigate('EditTask', item)}
            >
              <Text style={[styles.taskText, item.done && styles.doneTask]}>{item.text || 'Untitled'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const EditTaskScreen = ({ route, navigation }) => {
  const { id, text, description } = route.params;
  const [newText, setNewText] = useState(text);
  const [newDescription, setNewDescription] = useState(description);

  const updateTask = async () => {
    try {
      await updateDoc(doc(db, "tasks", id), { text: newText, description: newDescription });
      navigation.goBack();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <View style={styles.editContainer}>
      <TextInput
        style={styles.editInput}
        value={newText}
        onChangeText={setNewText}
        placeholder="Edit title"
      />
      <TextInput
        style={styles.editInput}
        value={newDescription}
        onChangeText={setNewDescription}
        placeholder="Edit description"
        multiline
      />
      <TouchableOpacity style={styles.updateButton} onPress={updateTask}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="TaskList">
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4E1',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D35400',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#F5CBA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#FAD7A0',
  },
  activeFilterButton: {
    backgroundColor: '#D35400',
  },
  filterButtonText: {
    color: '#784212',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0B27A',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#F5CBA7',
    borderRadius: 4,
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#E67E22',
  },
  taskText: {
    fontSize: 16,
    color: '#784212',
    flex: 1,
  },
  doneTask: {
    textDecorationLine: 'line-through',
    color: '#B9770E',
  },
  deleteButton: {
    color: '#C0392B',
    fontWeight: '600',
  },
});

export default AppNavigator;
