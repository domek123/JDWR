 <script>
    import {userLogged  , articleList, commentsList} from '../store.js'
    import ArticleSmall from './ArticleSmall.svelte'
    import { onMount } from 'svelte';
    let isUserAdmin = 0
    userLogged.subscribe(val => isUserAdmin = val.isAdmin)
 
    let ArticlesArray = []
    let commentsArray = []

    const getArticles = () => {

        fetch('http://localhost:3421/getArticles').then(response => response.json()).then(data => {
            data.records.forEach(item => {
                ArticlesArray.push({ArticleID: item[0] , header: item[1] , content: item[2] , photoName: "./news_img/" + item[3]})
                
            })
            ArticlesArray = ArticlesArray
            articleList.set(ArticlesArray)
            fetch('http://localhost:3421/getComments').then(response => response.json()).then(data =>{
                 data.records.forEach(item => {
                commentsArray.push({ArticleID: item[0] , AuthorLogin: item[1] , AuthorName: item[2] , content :  item[3]})
                
            })
            commentsList.set(commentsArray)
            })
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