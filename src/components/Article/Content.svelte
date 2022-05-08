<script>
    import {settings} from '../../store.js'
    export let value

    let style = {}

    settings.subscribe(value => style = value )
    console.log(style)
</script>


<div class="content-article" style="--articleContentFSize: {style.articleContentFSize};
 --articleContentColor: {style.articleContentColor};
 --articleContentAlign: {style.articleContentAlign}">{value}</div>

<style>
    .content-article{
        text-align: var(--articleContentAlign);
        font-size: var(--articleContentFSize);
        color: var(--articleContentColor);
    }
</style>