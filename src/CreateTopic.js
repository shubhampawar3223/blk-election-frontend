import React, { useEffect, useState, useRef } from 'react';

export default function CreateTopic(props) {
    const topicRef = useRef(null)
    const [topic,setTopic] = useState("")
    const [option1,setOption1] = useState("")
    const [option2,setOption2] = useState("")

    useEffect(()=>{
    },[])
    const clickEffect = (e)=>{
        e.preventDefault();
        // console.log(topic,option1,option2)       
        console.log(props.createTopic, props.setCreateTopic) 
        props.setCreateTopic(false)
        props.createTopic(topic,option1,option2)
    }
    return(
        <div>
            <form>
                    <div className="offset-4 col-4 mt-4">
                    <label>Enter Topic Name:</label>    
                    <input type="text" onChange={(e)=>setTopic(e.target.value)}  className="form-control"/>
                    </div>
                    <div className="offset-4 col-4 mt-3">
                    {/* <label>Enter Count of Options:</label>    
                    <input type="number" className="form-control" ref={numOptionsRef}/>
                    <button class="btn btn-primary" onClick={()=> setValues()}>Set</button>
                    {console.log(displayTopics,createTopicCount)}
                    {
                        displayTopics && (createTopicCount>0) ?
                            [...new Array(3)].map((temp,i)=>{
                                return (
                                    <input type="text" key={i}/>
                                )
                                })                                                   
                        :
                        <></>
                    } */}

                    <label>Enter Option1:</label>    
                     <input  onChange={(e)=>setOption1(e.target.value)} type="text" className="form-control"/>
                    </div>
                    <div className="offset-4 col-4 mt-3"> 
                     <label>Enter Option2:</label>    
                    <input onChange={(e)=>setOption2(e.target.value)}  type="text" className="form-control"/>
                    </div>

                    <div className="offset-4 col-4 ">
                    <button className="btn btn-primary offset-4 mt-3" onClick={(e)=>clickEffect(e)}>Create</button>
                    </div>
                </form>
        </div>
    )
}