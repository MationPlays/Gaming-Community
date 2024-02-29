import {useState, useEffect} from 'react'
import {GoogleAuthProvider,onAuthStateChanged, signInWithPopup} from 'firebase/auth'
import {doc,setDoc, getFirestore, getDoc, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp} from 'firebase/firestore'
import './App.css'
import { auth,app } from './firebase'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const db = getFirestore(app)
const storage = getStorage(app);

function App() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [image, setImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy("timestamp"))
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if(user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
  }, [])

  const sendMessage = async () => {
    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "messages"), {
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName,
        imageUrl,
        text: newMessage,
        timestamp: serverTimestamp()
      });

      setImage(null);
    } else {
      await addDoc(collection(db, "messages"), {
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName,
        text: newMessage,
        timestamp: serverTimestamp()
      })
    }
    setNewMessage("")
  }
  
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
    } catch (error) {
      console.log(error);
    }
  }

  const handleImageChange = e => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };


  return (
    <>
    <div className='App'>
      { user ? (
        <>
        <div>
        <div className='header1'><img id='pic'  src={"https://files.cults3d.com/uploaders/13940850/illustration-file/af3a9ca5-76dd-4f06-b86d-bd7d73495f40/1bcc0f0aefe71b2c8ce66ffe8645d365.png"}/> 
        <h2>Gaming-Community</h2></div>
        
        <div className='header2'><button className='btnLO' onClick={() => auth.signOut()}>Ausloggen</button></div>
        </div>
        <div className='infoLI'>eingeloggt als {user.displayName}</div>
        <input
            type='file'
            onChange={handleImageChange}
          />
        <input
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        />
      <button className='btnSend' onClick={sendMessage}>Nachricht senden</button>
      {/*<button className='btn' onClick={() => auth.signOut()}>Bild auswählen</button>*/}

      {messages.map(msg => (
  <div id="full_msg" key={msg.id}>
    <div id='mesg1' className={`message ${msg.data.uid === user.uid ? 'current' : 'other'}`}>
      <img id='pic' src={msg.data.photoURL} alt="User" />
      <div>
        <b>{msg.data.displayName}</b>{" "}
        <div id='time'>{msg.data.timestamp ? new Date((msg.data.timestamp.seconds) * 1000).toLocaleDateString("de-DE") : null}</div>{" "}
        <div id='time'>{msg.data.timestamp ? new Date((msg.data.timestamp.seconds) * 1000).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' }) : null}</div>
      </div>
    </div>
    <div id='mesg2'>
    
      <div id='mesg2_1'>{msg.data.imageUrl && <img src={msg.data.imageUrl} alt='Uploaded' />}</div>



<div id='mesg2_2'>
  {msg.data.text.startsWith("http://") || msg.data.text.startsWith("https://") ? (
    <a href={msg.data.text} target="_blank" rel="noopener noreferrer">
      {msg.data.text}
    </a>
  ) : (
    <span>{msg.data.text}</span>
  )}
</div>

      
    </div>
  </div>
))}

      </>):
      <>
      <div className='header'><img id='pic'  src={"https://files.cults3d.com/uploaders/13940850/illustration-file/af3a9ca5-76dd-4f06-b86d-bd7d73495f40/1bcc0f0aefe71b2c8ce66ffe8645d365.png"}/> 
      <h2>Gaming-Community</h2></div>
      <button className='btnLI' onClick={handleGoogleLogin}>Einloggen mit Google</button>
      </>
    }
    </div>
    </>
  )

  
}

export default App
