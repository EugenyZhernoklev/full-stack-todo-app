import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';

export default function App() {
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('http://192.168.0.171:3000/todos') // Твой IP + порт backend
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  const addTodo = () => {
    if (input.trim()) {
      fetch('http://192.168.0.171:3000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
        .then(res => res.json())
        .then(newTodo => setTodos([...todos, newTodo]))
        .catch(error => console.error('Error adding todo:', error));
      setInput('');
    }
  };

  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      fetch(`http://192.168.0.171:3000/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      })
        .then(() => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)))
        .catch(error => console.error('Error toggling todo:', error));
    } else {
      console.error('Todo not found for toggle');
    }
  };

  const deleteTodo = (id: number) => {
    fetch(`http://192.168.0.171:3000/todos/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(t => t.id !== id)))
      .catch(error => console.error('Error deleting todo:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mobile Todo App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Add a task..."
          onSubmitEditing={addTodo}
          autoCapitalize="sentences"
        />
        <Button title="Add" onPress={addTodo} color="#1E90FF" />
      </View>
      <FlatList
        data={todos}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Button
              title={item.completed ? '✓' : '□'}
              onPress={() => toggleTodo(item.id)}
              color={item.completed ? 'green' : 'gray'}
            />
            <Text style={[styles.todoText, item.completed && styles.completed]}>
              {item.text}
            </Text>
            <Button title="Delete" onPress={() => deleteTodo(item.id)} color="red" />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 18, marginRight: 10, height: 50 },
  todoItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, padding: 15, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  todoText: { flex: 1, marginHorizontal: 15, fontSize: 18, color: '#2c3e50' },
  completed: { textDecorationLine: 'line-through', color: '#7f8c8d' },
});
