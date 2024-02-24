const btnIngresar = document.querySelector("#btnIngresar")
const btnSalir = document.querySelector("#btnSalir")
const chat = document.querySelector("#chat")
const btnEnviar = document.querySelector("#btnEnviar")
const formulario = document.querySelector("#formulario")
const msgInicio = document.querySelector('#msgInicio')
const msgTemplate = document.querySelector("#msgTemplate")

import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js'
import { getFirestore, collection, addDoc,query, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDsg6pq_Oz5fPCnp4kaamI1SgsU_DrjGA8",
    authDomain: "chat-bootstrap1.firebaseapp.com",
    projectId: "chat-bootstrap1",
    storageBucket: "chat-bootstrap1.appspot.com",
    messagingSenderId: "608601865642",
    appId: "1:608601865642:web:87d2ec1ff90f3896277fd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)
let unsubscribe;
const eliminarElemento = (elemento) => {
    elemento.classList.add("d-none")
}
const visualizarElemento = elemento => {
    elemento.classList.remove("d-none")
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("existe el user ", user)
        eliminarElemento(btnIngresar)
        visualizarElemento(btnSalir)
        visualizarElemento(formulario)
        visualizarElemento(chat)
        eliminarElemento(msgInicio)

        const q = query(collection(db, "chats"), orderBy("fecha"));
        chat.innerHTML=""

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                  console.log("New mensaje: ", change.doc.data());
                  //manipulando el template
                  const clone = msgTemplate.content.cloneNode(true);
                  clone.querySelector("span").textContent = change.doc.data().msg
                  if( user.uid === change.doc.data().uid){
                    clone.querySelector("span").classList.add('bg-success')
                    clone.querySelector("div").classList.add('text-end')
                  }else{
                    clone.querySelector("span").classList.add("bg-secondary")
                    clone.querySelector("div").classList.add('text-start')
                  }
                  chat.append(clone)
              }
              chat.scrollTop = chat.scrollHeight
            });
          });
    } else {
        console.log("No existe usuario")
        eliminarElemento(btnSalir)
        visualizarElemento(btnIngresar)
        eliminarElemento(formulario)
        eliminarElemento(chat)
        visualizarElemento(msgInicio)
        if(unsubscribe){
            unsubscribe()
        }
    }
});
btnIngresar.addEventListener('click', async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log(result)
    } catch (error) {
        console.log(error)
    }

});
btnSalir.addEventListener('click', async () => {
    await signOut(auth);
});
var date= new Date()
formulario.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log(formulario.msg.value)
    if(!formulario.msg.value.trim()){
        formulario.msg.value=""
        formulario.msg.focus()
        return console.log("Tienes q escribir algo")
    }

    try {
        btnEnviar.disabled = true
        await addDoc(collection(db, "chats"), {
            msg: formulario.msg.value.trim(),//elimina espacios de adelante y atras
            uid: auth.currentUser.uid,
            fecha: date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate(),
        });
         formulario.msg.value = ""
    } catch (error) {
        console.log(error)
    }finally{
        btnEnviar.disabled = false
    }
});