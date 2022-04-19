 <script>
    import {userLogged} from '../store.js'
    import ArticleSmall from './ArticleSmall.svelte'
    import { onMount } from 'svelte';
    let isUserAdmin = 0
    userLogged.subscribe(val => isUserAdmin = val.isAdmin)

    let ArticlesArray = []

    const getArticles = () => {

        fetch('http://localhost:3421/getArticles').then(response => response.json()).then(data => {
            data.records.forEach(item => {
                ArticlesArray.push({ArticleID: item[0] , header: item[1] , content: item[2] , photoName: "./news_img/" + item[3]})
                
            })
            ArticlesArray = ArticlesArray
        })

    }

    onMount(() => getArticles())
 </script>
    <div class="articles-container">

    
 {#each ArticlesArray as Article}
    <ArticleSmall info={Article}/>

 {/each}
 </div>

{#if isUserAdmin == 1}

    <a href="/#/AddArticle"><div>Dodaj artykuł</div></a>
{/if}

<style>

    .articles-container{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>