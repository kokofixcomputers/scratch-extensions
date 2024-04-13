(function(ext) {
  let apiKey = null;
  let lastErrorMessage = '';
  let conversationHistory = [];
  let systemPrompt = '';

  ext.getResponse = async function(input, model) {
    if (!apiKey) {
      lastErrorMessage = 'Error: API key not set';
      return lastErrorMessage;
    }

    try {
      const messages = [];

      // Add the system prompt first, if it's set
      if (systemPrompt !== '') {
        messages.unshift({ role: 'system', content: systemPrompt });
      }

      // Add the conversation history
      conversationHistory.forEach((message) => {
        messages.push(message);
      });

      // Add the user's message
      messages.push({ role: 'user', content: input });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        lastErrorMessage = `Error: ${errorData.error.message}`;
        return lastErrorMessage;
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;

      // Add the assistant's response to the conversation history
      conversationHistory.push({ role: 'assistant', content: responseContent });

      return responseContent;
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      lastErrorMessage = 'Error: Failed to fetch response';
      return lastErrorMessage;
    }
  };

  ext.isApiKeySet = function() {
    return apiKey !== null;
  };

  ext.setApiKey = function(key) {
    return new Promise((resolve, reject) => {
      try {
        apiKey = key;
        resolve();
      } catch (error) {
        lastErrorMessage = 'Error setting API key';
        reject(error);
      }
    });
  };

  ext.clearApiKey = function() {
    apiKey = null;
    return Promise.resolve();
  };

  ext.getApiKey = function() {
    return apiKey || 'API key not set';
  };

  ext.getLastErrorMessage = function() {
    return lastErrorMessage;
  };

  ext.logApiResponse = function(input, model) {
    ext.getResponse(input, model).then((response) => {
      console.log('API Response:', response);
    });
  };

  ext.setConversationHistory = function(jsonString) {
    try {
      conversationHistory = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing conversation history JSON:', error);
    }
  };

  ext.setSystemPrompt = function(prompt) {
    systemPrompt = prompt;
  };

  ext.clearConversationHistory = function() {
    conversationHistory = [];
  };

  ext._shutdown = function() {};

  ext._getStatus = function() {
    return {
      status: 2,
      msg: 'Ready'
    };
  };

  const descriptor = {
    blocks: [
      ['r', 'get response %s (model %m.models)', 'getResponse', 'Hello, world!', 'gpt-3.5-turbo'],
      ['b', 'is api key set?', 'isApiKeySet'],
      ['w', 'set api key %s', 'setApiKey', 'YOUR_API_KEY_HERE'],
      ['w', 'clear api key', 'clearApiKey'],
      ['r', 'get api key', 'getApiKey'],
      ['r', 'get last error message', 'getLastErrorMessage'],
      ['w', 'log api response for %s (model %m.models)', 'logApiResponse', 'Hello, world!', 'gpt-3.5-turbo'],
      ['w', 'set conversation history %s', 'setConversationHistory', '[{"role": "system", "content": "your name is ChatGpt"},{"role": "user", "content": "Hello"},{"role": "assistant", "content": "hello how may i assist you today?"}]'],
      ['w', 'clear conversation history', 'clearConversationHistory'],
      ['w', 'set system prompt %s', 'setSystemPrompt', 'System prompt here']
    ],
    menus: {
      models: ['gpt-3.5-turbo', 'text-davinci-003', 'text-curie-001', 'text-babbage-001', 'text-ada-001']
    }
  };

  ScratchExtensions.register('ChatGPT', descriptor, ext);
})({});