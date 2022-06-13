import React from "react"
import "./App.css"
import abi from "./utils/ToDo.json"
import { ethers } from "ethers"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons"

function App() {

  const contractAddress = "0xAa46D82a2D7C241e27050Ed373f2D5A4ddF91748";
  const ABI = abi.abi;

  const [enteredItem, setEnteredItem] = React.useState("");
  const [itemList, setItemList] = React.useState([]);
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [connectText, setConnectText] = React.useState("Connect Wallet");
  const [displayText, setDisplayText] = React.useState("Change your Network to Rinkeby and connect to Metamask");


  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
        setDisplayText("Please Connect To Metamask");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);

      setConnectText(`Connected: ${currentAccount}`);

      getTask();

    } catch (error) {
      console.log(error);
    }
  }


  const itemEvent = (event) => {
    setEnteredItem(event.target.value)
  };

  const setTask = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const ToDo = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        console.log("Adding Task..")
        setDisplayText("Adding Task..");

        const addTaskTxn = await ToDo.setTask(enteredItem);

        setTimeout(() => setDisplayText("Ethereum is SLOW! Still mining your request"), 5000)

        await addTaskTxn.wait();

        console.log("mined ", addTaskTxn.hash);

        console.log("Task Added!");
        setDisplayText("Task Added!");

        getTask();

        // Clear the form fields.
        setEnteredItem("");
      }
    } catch (error) {
      console.log(error);
      setDisplayText("");
    }
  };

  const getTask = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const ToDo = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        console.log("fetching task from blockchain..");
        setDisplayText("fetching task from blockchain..");
        setItemList(await ToDo.getTask());
        console.log("fetched!");
        setDisplayText("");
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  const updateTask = async (id) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const ToDo = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        console.log("updating task..");
        setDisplayText("updating task..");
        if (!itemList[id].isCompleted) {
          const updateTodo = await ToDo.updateTask(id, true);
          setTimeout(() => setDisplayText("Ethereum is SLOW! Still mining your request"), 5000)
          await updateTodo.wait();

          console.log("Task Status Updated! You have Completed the Task");
          setDisplayText("Task Status Updated! You have Completed the Task");
          await getTask();

        }
        else {
          console.log("Task already completed")
          setDisplayText("Task already completed")
        }

      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
      setDisplayText("");
    }
  };

  const deleteTask = async (id) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const ToDo = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        console.log("Deleting Task..")
        setDisplayText("Deleting Task..")
        const deleteTask = await ToDo.deleteTodoItem(id);
        setTimeout(() => setDisplayText("Ethereum is SLOW! Still mining your request"), 5000)
        await deleteTask.wait();

        console.log("Task Deleted!");
        setDisplayText("Task Deleted!");

        getTask();

      }
    } catch (error) {
      console.log(error);
      setDisplayText("");
    }
  };


  const liItemList = itemList.map((item, index) => {
    return (
      <div key={index} className="tasks">
        <li>{item}</li>
        <div className="btn">
          <button className="completed" title="Task Completed" onClick={() => updateTask(index)}><FontAwesomeIcon icon={faCheck} /></button>
          <button className="delete" title="Delete Task" onClick={() => deleteTask(index)}><FontAwesomeIcon icon={faTrash} /></button>
        </div>
      </div>
    )
  })

  React.useEffect(() => {
    isWalletConnected();
  })

  return (
    <div className="main-div">
      <h1 className="logo">ToDo DApp</h1>
      <h2 className="status">{displayText}</h2>
      <button className="connect-wallet" onClick={connectWallet}>{connectText}</button>
      <div className="center-div">
        <h1 className="title">ToDo List</h1>
        <input type="text" placeholder="Add ToDo Items"
          onFocus={(e) => e.target.placeholder = ''}
          onBlur={(e) => e.target.placeholder = 'Add ToDo Items'}
          value={enteredItem} onChange={itemEvent} />
        <button className="add-task-btn" onClick={setTask}><FontAwesomeIcon icon={faPlusCircle} /></button>
        <ol>
          {liItemList}
        </ol>

      </div>

    </div>
  )
}

export default App;