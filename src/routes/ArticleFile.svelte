<script>

    import {onMount} from 'svelte'
    export let params
    import {userLogged , userName , commentsList, settings} from '../store.js'
    import Content from "../components/Article/Content.svelte"
    import Header from "../components/Article/Header.svelte"
    import Comment from "../components/Article/Comment.svelte"
    import List from '../components/List.svelte'

    let styles = {
        color: "red"
    }

    settings.subscribe(value => console.log(value))

    
    let info = {}
    let commentValue
    let comments = []

    let items = []

    let userInfo = null
    let userNameInfo = undefined
    userName.subscribe(value => userNameInfo = value)
    userLogged.subscribe(value => {userInfo = value; console.log(value)})
    commentsList.subscribe(value => {
        comments = value.filter(item => item.ArticleID == params.bound)
    })

   

    const getArticle = () => {
        fetch("http://localhost:3421/getSingleArticle", {method: 'post' , body: JSON.stringify({ArticleID: params.bound}), headers: {"Content-Type": "application/json" }}).then(response => response.json()).then(data => {
            info = [...data]
            items.push({value: data[1] , component: Header})
            items.push({value: data[2] , component: Content})
            items= [...items]
        })
    }

    onMount(() => getArticle())

    const addComment = () => {
        const body = JSON.stringify({ArticleID: params.bound , AuthorName: userInfo.fullName, AuthorLogin: userNameInfo , Content: commentValue})
        const headers = { "Content-Type": "application/json" };
          fetch("http://localhost:3421/addComment" , {method: 'post' , body , headers}).then(response => response.json()).then(data => {
              const commentsArray = []
                
                data.records.forEach(item => {
                commentsArray.push({ArticleID: item[0] , AuthorLogin: item[1] , AuthorName: item[2] , content :  item[3]})
                
            })
            commentsList.set(commentsArray)
              
          })
    }


</script>

<div class="Article-container" style="--colortext: {styles.color}">
    <div class="content-article">
        <List {items}/>
        <img  src={`./news_img/${info[3] == undefined ? "tlo.jpg" : info[3]}`} alt="something"/>
        
       
    </div>
    <div>Komentarze</div>
    {#if userInfo.isAdmin != undefined}
        <div>
            <h3>Napisz komentarz</h3>
            <textarea bind:value={commentValue}  cols="30" rows="10"></textarea>
            <button on:click={addComment}>Send</button>
        </div>
    {/if}
    <div id="comments">
        {#each comments as comment}
            <Comment value={comment}/>
        {/each}
    </div>

</div>

<style>
    .Article-container{
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--colortext);
    }
    .content-article{
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
</style>