<script>
    import {settings} from '../../store.js'
    export let value

    let style = {}

    settings.subscribe(value => style = value )
    console.log(style)
</script>


<div class="header-article" style="--articleHeaderFSize: {style.articleHeaderFSize};
 --articleHeaderColor: {style.articleHeaderColor};
 --articleHeaderAlign: {style.articleHeaderAlign}">{value}</div>

<style>
    .header-article{
        text-align: var(--articleHeaderAlign);
        font-size: var(--articleHeaderFSize);
        color: var(--articleHeaderColor);
    }
</style>