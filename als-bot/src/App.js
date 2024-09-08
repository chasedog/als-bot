import React, { useState, useEffect } from 'react';
import './App.css';

const defaultInstructions = "I'm trying to communicate with someone with ALS who can't speak. When I ask a question, respond with 10 options for them to choose from. Simply return with a JSON array of strings of choices please. Do not return with an object."

function App() {
  const apiKey = localStorage.getItem('apiKey');
  const [showingInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [options, setOptions] = useState(null);
  const [question, setQuestion] = useState('How are you feeling today?');
  const [questions, setQuestions] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const getMoreOptions = async () => {
    const prompt = `Please provide options for the question: '${question}'`;
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: instructions },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300
        })
      });
      const data = await response.json();
      const o = JSON.parse(data.choices[0].message.content);
      setOptions(o);
      setLoading(false);
    } catch (error) {
      setResponse('Error fetching more options: ' + error.message);
      setLoading(false);
    }
  }

  const generateQuestions = async () => {
    const prompt = `The person who can't talk wants to ask questions for the people in the room. It should be basic conversational stuff about how the day is going or what's for dinner or about family members, etc. Generate 15 questions in JSON format "questions" as an array of strings of questions.`;
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        })
      });

      const data = await response.json();
      const o = JSON.parse(data.choices[0].message.content).questions;
      console.log(o);
      setQuestions(o);
      setLoading(false);
    } catch (error) {
      setResponse('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setQuestion(event.target.value);
  };

  return (
    <div className="App">
      <h1>ALS Chat</h1>
      <div>
        {showingInstructions && <textarea onChange={(e) => setInstructions(e.target.value)} value={instructions} />}
      </div>
      <div>
        <button onClick={() => setShowInstructions(!showingInstructions)}>{showingInstructions ? 'Hide instructions' : 'Show instructions'}</button>
      </div>
      <div>
        <input
            type="text"
            value={question}
            onChange={handleInputChange}
            placeholder="Enter your question here"
            required
        />
        <button onClick={() => getMoreOptions()}>Generate answers</button>
      </div>
      <div className="button-container">
        {options && options.map((option, index) => (
          <p key={index}>
            {index + 1}. {option}
          </p>
        ))}
      </div>

      <div className="button-container">
        <button onClick={() => generateQuestions()}>I want to ask a question...</button>
      </div>
      <div>
        {questions && questions.map((q, index) => (
          <p key={q}>{index + 1}. {q}</p>
        ))}
      </div>
      {loading && <p>Thinking...</p>}
      <div className="response-container">
        {response && <p>{response}</p>}
      </div>
    </div>
  );
}

const ApiKeyApp = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [isApiKeySet, setIsApiKeySet] = useState(!!apiKey);
  const [inputValue, setInputValue] = useState(apiKey);
  
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
      setIsApiKeySet(true);
    }
  }, [apiKey]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSave = () => {
    setApiKey(inputValue);
  };

  return (
    <div className="ApiKeyApp">
      {isApiKeySet ? (
        <App />
      ) : (
        <div className="api-key-container">
          <h1>Please Enter Your API Key</h1>
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter your API key here"
            rows="4"
            cols="50"
          />
          <button onClick={handleSave}>Save API Key</button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyApp;
