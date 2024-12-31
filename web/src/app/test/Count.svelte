<script lang="ts">
  import type { ClientMessage, ServerMessage } from "../../server"
  import { onMount } from "svelte";

  const wsurl = "http://localhost:3000/count";

  let ws: WebSocket | null = null;
  let countPromise = $state(new Promise<number>(()=>{}));

  async function connect() {
    ws = new WebSocket(wsurl);

    ws.addEventListener("message", e => {
      const message: ServerMessage = JSON.parse(e.data.toString());
      if (message.kind == "count") {
        countPromise = Promise.resolve(message.value);
      }
    })

    ws.addEventListener("close", async e => {
      countPromise = Promise.reject(new Error(e.reason));
      setTimeout(connect, 4000);
    })
  }

  function add() {
    const message: ClientMessage = {
      kind: "count",
    }
    ws?.send(JSON.stringify(message));
  }

  onMount(connect);
</script>

{#await countPromise}
  <div>loading...</div>
{:then count}
  <button onclick={add}>Count {count}</button>
{:catch error}
  <div class="text-red-600">
    WSDisconnect, {"message" in error ? error.message : error}, reconnecting...
  </div>
{/await}

