import React, { useEffect, useState, useRef } from 'react';
import Web3 from 'web3';
import { Election_address, Election_abi } from './config'
import CreateTopic from './CreateTopic';

function ElectionPortal() {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState();
    const [topics, setTopics] = useState([])
    const [topic, setTopic] = useState({})
    const [isTopicSelected, setTopicSelected] = useState(false)
    const [toCreateTopic, setCreateTopic] = useState(false)
    const [createTopicCount, setCreateTopicCount] = useState(0)
    const [displayTopics, setDisplayTopics] = useState(false)
    const [isVoted, setIsVoted] = useState(false)
    const [warning1, setWarning1] = useState(false)
    const [warning2, setWarning2] = useState(false)
    const numOptionsRef = useRef()
    let ref1 = useRef(null)

    useEffect(async () => {
        // console.log("Hiee")
        await loadWeb3();
        loadBlockchainData();
    }, [topic]);

    const setValues = () => {
        console.log(numOptionsRef.current.value)
        setDisplayTopics(true)
        setCreateTopicCount(numOptionsRef.current.value)
    }

    async function loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert("Please use ethereum browser,use metamask instead.")
        }
    }

    async function loadBlockchainData() {
        const web3 = window.web3;
        let _account = await web3.eth.getAccounts();
        console.log(_account[0]);
        setAccount(_account[0]);
        const election = new web3.eth.Contract(Election_abi, Election_address);
        console.log(election);
        setContract(election)
        const totalTopics = await election.methods.totalTopics().call();
        console.log(totalTopics)
        if (totalTopics > 0) {
            let j = 0
            let tempTopics = []
            while (j < totalTopics) {
                let _topic = await election.methods.topics(j).call()
                if (!_topic.isDeleted) {
                    console.log(_topic)
                    tempTopics.push(_topic)
                }
                j++;
            }
            setTopics(tempTopics)
        }

    }

    const createTopic = async (topic, option1, option2) => {
        try{
        console.log(topic, option1, option2, "ffkls")
        if(topic.length==0){
            window.alert( "Topic should not be empty.")
        }
        else if(option1.length==0){
            window.alert("Option1 should not be empty.")
        }
        else if(option2.length==0){
            window.alert("Option2 should not be empty.")
        }
        else{
        let response = await contract.methods.createTopic(topic, [option1, option2]).send({ from: account })
        console.log(response)
        window.alert("New topic is created.")
        window.location.reload(false)
        }
        }
        catch(error){
        window.alert("Only Owner of the contract can create the topic.")
        }
    }

    const selectTopic = async (val) => {
        setCreateTopic(false)
        // console.log(val[0])
        let result = await contract.methods.getOptions(+val[0]).call()
        console.log("resulttt", result)
        let tempOptions = []

        for (let i = 0; i < result[0].length; i++) {
            let option = {}
            option.optionId = result[0][i]
            option.optionName = result[1][i]
            option.votes = result[2][i]
            console.log(option)
            tempOptions.push(option)
        }
        console.log(tempOptions)
        setTopic({ topicId: +val[0], topicName: val.topicName, status: val.status, options: tempOptions })
        setTopicSelected(true)
    }

    const initiateCreateTopic = () => {
        setCreateTopic(true)
        setTopicSelected(false)
    }

    const initiateStartOrStop = async (topicId, statusCode) => {
        console.log(topicId)
        let response
        if (statusCode == 1) {
            response = await contract.methods.startVoting(topicId).send({ from: account })
        }
        else {
            response = await contract.methods.stopVoting(topicId).send({ from: account })
        }
        console.log(response)
        if (response) {
            let tempTopic = topic
            tempTopic.status = statusCode
            setTopic(tempTopic)
            console.log("Topic", tempTopic)
            if (statusCode == 1) {
                window.alert("Voting has started.")
            } else {
                window.alert("Voting is stopped.")
            }
            window.location.reload()

        }
    }

    const initiateDeleteTopic = async (topicId) => {
        console.log(topicId)
        const response = await contract.methods.removeTopic(topicId).send({ from: account })
        console.log(response)
        let tempTopic = topic
        tempTopic.isDeleted = true
        setTopic(tempTopic)
        console.log("Topic", tempTopic)
        window.alert("Topic is deleted.")
        window.location.reload()
    }

    const initiateVote = async (index) => {
        if (+topic.status === 1) {
            console.log(index)
            setIsVoted(true)
            const records = await contract.methods.getVoterRecords(topic.topicId).call();
            console.log(records)
            let isUserVoted = false
            records.map((record) => {
                if (record[1] === account) {
                    isUserVoted = true
                }
            })
            if (isUserVoted) {
                console.log(ref1.current)
                ref1.current.checked = false;
                window.alert("You have already voted.")
            }
            else {
                let response = await contract.methods.vote(topic.topicId, index).send({ from: account })
                console.log(response)
                let tempTopic = topic
                tempTopic.options[index].votes = tempTopic.options[index].votes + 1
                setTopic(topic)
                console.log(tempTopic)
                window.alert("your vote is recorded")
                window.location.reload()
            }

        }
        else if (+topic.status === 0) {
            window.alert("Voting has not started.")
        }
        else {
            window.alert("Voting has stopped.")
        }

    }

    return (
        <div className="container">
            <p className="offset-4">Your Account:  {account}   (Refresh the page after account change.)</p>
            <h1 className="mt-2 text-center">Election Portal</h1>
            <div className="mt-2 d-flex justify-content-center">
                <div>
                <button className="btn btn-primary mt-4" onClick={() => initiateCreateTopic()}>Create Topic </button>
                </div>
            </div>
            <div className="offset-3 col-6 mt-4">
            <h3 className="mt-3 align-center">Select topic to vote</h3>
            <select className="form-select" aria-label="Default select example">
                <option selected>Select Topic</option>
                {
                    topics.length ?
                        topics.map((_topic, i) => {
                            return (
                                <option onClick={() => selectTopic(_topic)} key={_topic.topicId}>{_topic.topicName}</option>
                            )
                        })
                        :
                        <></>
                }
            </select>
            </div>
            <div className="offset-5">
            {topics.length == 0 && <label className="">No topic currently available.</label>}
            </div>    
            {
                isTopicSelected ?
                    <div >
                        <div className="mt-4">
                            <div className="offset-4 col-4 " >

                                {topic.status == 0 && <button className="btn btn-primary m-2" onClick={() => initiateStartOrStop(+topic.topicId, 1)}>Start Voting </button>}
                                {topic.status == 1 && <button className="btn btn-primary m-2" onClick={() => initiateStartOrStop(+topic.topicId, 2)}>Stop Voting </button>}
                                <button className="btn btn-danger m-2" onClick={() => initiateDeleteTopic(+topic.topicId)}>Delete Topic </button>
                            </div>
                            <div>
                                {
                                    console.log(topics)
                                }
                                <h3 className="offset-4 col-4 mx-auto">Topic: {topic.topicName}</h3>
                                {
                                    console.log(topic)
                                }
                                {
                                    topic.options.map((_option, i) => {
                                        return (
                                            <div className="offset-4 col-4 d-flex-justify-content-center mt-2" key={_option.topicId}>
                                                <div className="form-check">
                                                <input className="form-check-input" type="checkbox" value="" ref={ref1} id="flexCheckDefault" onClick={() => initiateVote(i)} disabled={isVoted} />
                                                <label className="form-check-label" for="flexCheckDefault" disabled="true">
                                                    {_option.optionName}
                                                </label>
                                                <label className="offset-1" >{_option.votes} votes</label>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>

                    </div>
                    :
                    <></>
            }

            {
                toCreateTopic ?
                    <CreateTopic setCreateTopic={setCreateTopic} createTopic={createTopic} />
                    :
                    <></>
            }
        </div>
    )
}

export default ElectionPortal;
