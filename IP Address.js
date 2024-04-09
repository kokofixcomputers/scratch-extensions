class GetIPAddress {
  getInfo() {
    return {
      id: 'getipaddress',
      name: 'Get IP Address',
      blocks: [
        {
          opcode: 'getIPAddress',
          blockType: 'reporter',
          text: 'My IP Address'
        }
      ]
    };
  }

  getIPAddress() {
    const url = 'https://api.ipify.org?format=json';
    return fetch(url)
      .then(response => response.json())
      .then(data => data.ip);
  }
}

Scratch.extensions.register(new GetIPAddress());