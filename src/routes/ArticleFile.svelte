<script>

    import {onMount} from 'svelte'
    export let params
    import Content from "../components/Article/Content.svelte"
    import Header from "../components/Article/Header.svelte"
    import List from '../components/List.svelte'

    
    let info = {}

    const items = [
        
        {value: "CONTENT" , component: Content},
        {value: "HEADER" , component: Header},
    ]

   

    const getArticle = () => {
        fetch("http://localhost:3421/getSingleArticle", {method: 'post' , body: JSON.stringify({ArticleID: params.bound}), headers: {"Content-Type": "application/json" }}).then(response => response.json()).then(data => info = [...data])
    }

    onMount(() => getArticle())


</script>

<div class="Article-container">
    <div class="content-article">
        <h1>{info[1]}</h1>
        <div>{info[2]}</div>
        <img  src={`./news_img/${info[3] == undefined ? "tlo.jpg" : info[3]}`} alt="something"/>
        <List {items}/>
       
    </div>
</div>

<style>
    .Article-container{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content-article{
        width: 70%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
</style>