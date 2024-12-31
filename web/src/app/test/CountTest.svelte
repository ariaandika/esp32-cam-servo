<script module lang="ts">

class Counter {
  count = $state(0);

  add() {
    this.count++;
  }
}

</script>


<script lang="ts">
  let counter = new Counter();

  let count = $state(0);
</script>


<section class="container mx-auto w-full">
  <button
    onclick={() => counter.add()}
    class="p-2 bg-indigo-500 text-white font-bold rounded-xl"
  >
    Count {counter.count}
  </button>
</section>

<section class="container mx-auto w-full">
  <button
    onclick={() => count++}
    class="p-2 bg-indigo-500 text-white font-bold rounded-xl"
  >
    Count 2 {count}
  </button>
</section>


