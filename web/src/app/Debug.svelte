<script lang="ts">
  import { WsController } from "./lib.svelte"

  let ws = new WsController("/admin");

  function mockgeo() {
    ws.send({
      kind: "device:geo:send",
      value: { lat: Math.random() + 7, lon: Math.random() + 7 }
    })
  }

  function door() {
    ws.send({
      kind: "door:toggle",
    })
  }

</script>

<section class="container mx-auto p-4 max-w-256 grid gap-4">
  <section>
    {#await ws.promise}
      <div>loading websocket...</div>
    {:then}
      <pre>{JSON.stringify(ws.state,null,2)}</pre>
    {:catch err}
      <div class="text-red-600 font-bold">
        WebSocketError: {err?.message ?? err}, reconnecting...
      </div>
    {/await}
  </section>

  <button
    onclick={mockgeo}
    class="px-3 py-2 bg-indigo-500 text-white font-bold rounded-md"
  >
    Mock Geo
  </button>
  <button
    onclick={door}
    class="btn"
  >
    Toggle Door
  </button>
</section>

