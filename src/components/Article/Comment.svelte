<script>
    export let value;

    console.log(value);
</script>

<div class="com">
    <div class="com-login">{value.AuthorLogin}</div>
    <div class="com-content">{value.content}a</div>
</div>

<style>
    .com {
        border-bottom: 1px dashed rgba(128, 128, 128, 0.5);
    }
    .com-login {
        font-weight: bolder;
    }
    .com-content {
        margin-left: 10px;
    }
</style>
