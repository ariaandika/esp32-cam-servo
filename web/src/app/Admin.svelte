<script lang="ts">
  import { WsController, GeoController } from "./lib.svelte"
  import { onDestroy } from "svelte";

  let ws = new WsController("/admin");
  let geo = new GeoController(ws);

  onDestroy(() => {
    ws.destroy();
    geo.destroy();
  })
</script>


<section class="w-full h-screen grid place-items-center">
  <section class="grid">
    {#await geo.promise}
      <div>loading geolocation...</div>
    {:then}
      <div>Geolocation: OK</div>
    {:catch err}
      <div class="text-red-600 font-bold">
        GeolocationError: {err?.message ?? err}
      </div>
    {/await}

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
  </section>
</section>

