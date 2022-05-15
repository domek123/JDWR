<script>
    import {
        userLogged,
        articleList,
        commentsList,
        settings,
    } from "../store.js";
    import ArticleSmall from "./ArticleSmall.svelte";
    import { onMount } from "svelte";
    import "./style/ButtonsAdd.css";
    let isUserAdmin = 0;
    userLogged.subscribe((val) => {
        (isUserAdmin = val.isAdmin), console.log("XDDDDDDD");
    });
    settings.subscribe((val) => {
        console.log(val);
    });

    let sortName = "alfabetycznie"
    let lengthOf = null

    let ArticlesArray = [];
    let commentsArray = [];

    let writeWord = ""

    let basicArray = []
    let categoryArray = ["wszystkie"]

    const findWords = () => {
       

        let helperArray = []

        console.log(writeWord)


        if(writeWord == "" || lengthOf != ArticlesArray.length){
            ArticlesArray = [...basicArray]
        }


            ArticlesArray.forEach(item => {
            if(item.content.includes(writeWord)){
                helperArray.push(item)
            }
        })
        

        
        
        
        console.log(ArticlesArray)
        ArticlesArray = [...helperArray]
    }

    const sorting = () => {
        if(sortName == "alfabetycznie"){
            ArticlesArray.sort((a,b) => (a.header > b.header) ? 1 : ((b.header > a.header) ? -1 : 0))
        }else{
            ArticlesArray = []
            commentsArray = []
            getArticles()
        }
       
        console.log(ArticlesArray)
        ArticlesArray = ArticlesArray
    }
    let category = "wszystkie"

    const changeCategory = () => {
        if(category == "wszystkie"){
            ArticlesArray = [...basicArray]
        }else{
            ArticlesArray = [...basicArray]
            let helperArray = []
            ArticlesArray.forEach(item => {
                if(item.category == category){
                    helperArray.push(item)
                }
            })
            ArticlesArray = [...helperArray]
        }
    }

    const getArticles = () => {
        fetch("http://localhost:3421/getArticles")
            .then((response) => response.json())
            .then((data) => {
                categoryArray = []
                lengthOf = data.length
                data.records.forEach((item) => {
                    ArticlesArray.push({
                        ArticleID: item[0],
                        header: item[1],
                        content: item[2],
                        photoName: "./news_img/" + item[3],
                        category: item[5]
                    });
                if(!categoryArray.includes(item[5])){
                    categoryArray.push(item[5])
                }
                categoryArray = categoryArray
                basicArray = [...ArticlesArray]
                });
                categoryArray.push('wszystkie')
                categoryArray = categoryArray
                ArticlesArray = ArticlesArray;
                articleList.set(ArticlesArray);
                fetch("http://localhost:3421/getComments")
                    .then((response) => response.json())
                    .then((data) => {
                        data.records.forEach((item) => {
                            commentsArray.push({
                                ArticleID: item[0],
                                AuthorLogin: item[1],
                                AuthorName: item[2],
                                content: item[3],
                            });
                        });
                        commentsList.set(commentsArray);
                    });
            });
    };

    onMount(() => getArticles());
</script>

<button on:click={sorting}>Sortuj</button>
<select name="" id="" bind:value={sortName} >
    <option value="alfabetycznie">alfabetycznie</option>
    <option value="data">wg daty</option>
</select>
<input type="text"  bind:value={writeWord}>
<button on:click={findWords}>FIND</button>

<select name="" id="" bind:value={category} on:change={changeCategory}>
    {#each categoryArray as cat}
        <option value={cat}>{cat}</option>
    {/each}
</select>


<div class="articles-container">
    {#each ArticlesArray as Article}
        <ArticleSmall info={Article} />
    {/each}
</div>


{#if isUserAdmin == 1}<a href="/#/AddArticle" class="add">Dodaj artykuł</a>{/if}

<style>
    .articles-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
