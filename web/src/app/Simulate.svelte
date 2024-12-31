<script lang="ts">
  import { WsController } from "./Admin.svelte"

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

<section class="container mx-auto p-4 grid gap-4">
  <button
    onclick={mockgeo}
    class="px-3 py-2 bg-indigo-500 text-white font-bold rounded-md"
  >
    MockGeo
  </button>
  <button
    onclick={door}
    class="px-3 py-2 bg-indigo-500 text-white font-bold rounded-md"
  >
    Door
  </button>
</section>

