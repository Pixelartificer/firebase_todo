import { useState, useEffect } from "react"
import { getDatabase, push, ref, set, onValue } from "firebase/database";


const App = () => {

  let [inputValue, setInputValue] = useState("")
  let [todos, setTodos] = useState([]

  )




  const db = getDatabase();
 

  //   let habdleInput = (event)=>{
  //   setInputValue(event.target.value)
  // }

  let handleTodo = () => {
    set(push(ref(db, 'todos/')), {
   input: inputValue
  }).then(()=>{
    alert("Data has been saved successfully");
    setInputValue("");
  }).catch((error)=>{
    alert("unsuccessful, error: " + error);
  } 
)}

useEffect(() => {
  const todosRef = ref(db, 'todos/');
  onValue(todosRef, (snapshot) => {

let todos = [];

   snapshot.forEach((item) => {
    todos.push(item.val());
   });
   setTodos(todos);  
  });
}, []); 




  return (
    <div>
      <input value={inputValue} onChange={(e)=>setInputValue(e.target.value)} type="text" placeholder="What in your mind...." />
      <button onClick={handleTodo}>Add ToDo</button>

      <ul>
        {todos.map(item =><li>{item.input}</li>)}
      </ul>
    
    </div>
  )
}

export default App