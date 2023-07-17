<script>
    let running = false;
    let input;
    let messages = [];
    async function sendChat(){
        // Add user message
        messages.push({
            type: "user",
            content: input
        });
        messages = [...messages];
        // Add AI response
        messages.push({
            type: "ai",
            content: ""
        });
        let lastIndex = messages.length - 1;

        // Send to AI endpoint
        let url = "/api/chat";
        const response = await fetch(url, {
            method:"POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({prompt: input})
        });
        running = true;
        input = "";
        //Receive streamed response
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            const lines = value.split('\n\n');
            for (const line of lines) {
                const [key, content] = line.split(':');
                if(key === "data"){
                    messages[lastIndex].content = messages[lastIndex].content + content;
                }
            }
        }
        messages = [...messages];
    }
</script>
<main>
    <h1 class="text-3xl font-bold ">
        Demo chat
    </h1>
    <div class="ml-auto mr-auto relative">
        {#each messages as msg}
            <div class="chat {msg.type==='user'?'chat-start':'chat-end'}">
                <div class="chat-bubble">{msg.content}</div>
            </div>
        {/each}
    </div>
    <form on:submit={sendChat} disabled={running}>
        <div class="flex flex-row gap-1 p-2 fixed bottom-2 w-full ml-auto mr-auto">
            <input type="text" bind:value={input} placeholder="Type here" class="input input-bordered input-primary w-full" />
            <button type="submit" class="btn btn-primary">Send</button>
        </div>
    </form>
</main>