<script>
    let numberOfArticles = 3
    import {settings} from '../store.js'
    let setting = {}
    let importFile = []
    
    settings.subscribe(value => {setting = value;console.log(value)
    
    })

    const setSettings = () => {
        settings.set(setting)
        let listOfSettings = []
        for (const property in setting){
            listOfSettings.push({name: property , value: setting[property]})
        }
        console.log(listOfSettings)
        const body = JSON.stringify({listOfSettings})
        const headers = {"Content-Type": "application/json" }
        fetch('http://localhost:3421/editConfig',{method: 'post' , body , headers}).then(response => response.json()).then(data => {console.log(data)})
    }

    const exportData = () => {
        const data = JSON.stringify(setting)
        const link = document.createElement("a");
        link.download = "config.json";
        const file = new Blob([data], {type: "application/json"});
        link.href = URL.createObjectURL(file);
        link.click();
        link.delete;
    }
    async function importData() {
        const text = await importFile[0].text();
        let json = JSON.parse(text);
        setting = json
    }

    

</script>

<div>
    <div>
        <div class="form-item">
            <div class="about-in">Ilość ostatnich artykułów</div>
            <input type="range" min="1" max="6"  bind:value={setting.numberOfArticles}>
            <div>{setting.numberOfArticles}</div>
        </div>
        <div class="form-item">
            <div class="about-in">Header Color</div>
            <input type="color" bind:value={setting.headersColor}>
        </div>
        <div class="form-item">
            <div class="about-in">Header Font Size</div>
            <input type="text" bind:value={setting.headersFSize}>
        </div>
        <div class="form-item">
            <div class="about-in">Układ bloków</div>
            <select bind:value={setting.blocks}>
            <option value="Slider-News-Info">Slider-News-Info</option>
            <option value="News-Slider-Info">News-Slider-Info</option>
            <option value="Info-Slider-News">Info-Slider-News</option></select>
        </div>
        <div class="form-item">
            <div class="about-in">Header Align</div>
            <select bind:value={setting.headersAlign}>
            <option value="center">center</option>
            <option value="flex-start">left</option>
            <option value="flex-end">right</option></select>
        </div>
        <div class="form-item">
            <div class="about-in">Section Color</div>
            <input type="color" bind:value={setting.sectionColor}>
        </div>
        <div class="form-item">
            <div class="about-in">Section Font Size</div>
            <input type="text" bind:value={setting.sectionFSize}>
        </div>
        <div class="form-item">
            <div class="about-in">Header Decoration</div>
            <select bind:value={setting.headerDecoration}>
            <option value="none">none</option>
            <option value="underline">underline</option></select>
        </div>
        <div class="form-item">
            <div class="about-in">Slider Header Font Size</div>
            <input type="text" bind:value={setting.sliderHeaderFSize}>
        </div>
        <div class="form-item">
            <div class="about-in">Slider Content Font Size</div>
            <input type="text" bind:value={setting.sliderContentFSize}>
        </div>
        <div class="form-item">
            <div class="about-in"> Slider justify</div>
            <select bind:value={setting.sliderFlex}>
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="flex-end">flex-end</option></select>
            
        </div>
        <div class="form-item">
            <div class="about-in">Slider Align</div>
             <select bind:value={setting.sliderAlign}>
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="flex-end">flex-end</option></select>
            
        </div>
        <div class="form-item">
            <div class="about-in">slider Header Color</div>
            <input type="color" bind:value={setting.sliderHeaderColor}>
            
        </div>
        <div class="form-item">
            <div class="about-in">sliderContentColor</div>
            <input type="color" bind:value={setting.sliderContentColor}>
            
        </div>
        <div class="form-item">
            <div class="about-in">articleHeaderFSize</div>
            <input type="text" bind:value={setting.articleHeaderFSize}>
            
        </div>
        <div class="form-item">
            <div class="about-in">articleHeaderColor</div>
            <input type="color" bind:value={setting.articleHeaderColor}>
            
        </div>
        <div class="form-item">
            <div class="about-in">articleHeaderAlign</div>
            <select bins:value={setting.articleHeaderAlign}>
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="flex-end">flex-end</option></select>
            
        </div>
        <div class="form-item">
            <div class="about-in">articleContentFSize</div>
            <input type="text" bind:value={setting.articleContentFSize}>
            
        </div>
        <div class="form-item">
            <div class="about-in"> articleContentColor</div>
            <input type="color" bind:value={setting.articleContentColor}>
            
        </div>
        <div class="form-item">
            <div class="about-in">Slider Duration</div>
            <input type="text" bind:value={setting.SliderDuration}>
            
        </div>
        <div class="form-item">
            <div class="about-in"></div>
            
        </div>
    </div>
    <button on:click={setSettings}>SET</button>
    <button on:click={exportData}>EXPORT</button>
    <input type="file" bind:files={importFile} on:change={importData}>
</div>

<style>
    .form-item{
        display: flex;
        flex-direction: row;

    }
    .form-item> * {
        margin: 10px;
    }
</style>