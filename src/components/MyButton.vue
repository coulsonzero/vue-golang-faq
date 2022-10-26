<template>
  <div class="button-container">
    <div class="button">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.625 3H7.375V7.375H3V8.625H7.375L7.375 13H8.625V8.625H13V7.375L8.625 7.375V3Z"
          fill="black"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$color-white: #ffffff;
$button-width: 30px;

.button-container {
  /* background: #c6c6c661; */
  background-image: linear-gradient(
    -225deg,
    #eddbff 0%,
    #aed6ff 30%,
    #d7fffe 70%,
    #fffeff 100%
  );
  /* background: #323232; */
  /* border-radius: 50%; */
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  &::before {
    content: "";
    width: calc($button-width + 0px);
    height: calc($button-width + 0px);
    border: 3px solid rgba(255, 255, 255, 0.2);
    -webkit-box-shadow: 0 0 8px #fff;
    box-shadow: 0 0 8px #fff;
    border-radius: 50%;
    position: absolute;
    animation: 4s ease-out infinite ani;
  }
}
.button {
  width: $button-width;
  height: $button-width;
  cursor: pointer;
  background-color: $color-white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: 0.2s ease-in;

  svg {
    height: 30px;
    width: 30px;
  }
  svg:not(:root) {
    overflow: hidden;
  }
  path {
    fill-rule: evenodd;
    clip-rule: evenodd;
    fill: black;
  }
}

@keyframes ani {
  0% {
    /* box-shadow: 0 0 8px; */
    border-width: 3px;
  }
  50% {
    /* box-shadow: 0 0 20px; */
    border-width: 6px;
  }
  100% {
    /* box-shadow: 0 0 8px; */
    border-width: 3px;
  }
}
</style>


