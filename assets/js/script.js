//////////////////////////////////////////////////////
//////////////// UTILS FUNCTION START ////////////////
//////////////////////////////////////////////////////

/**
 * Function ton convert data into a base64 encoded URL

 * @param {Int[]} data - Data array of one dimension
 * @param {Int} width - Width of the array
 * @param {Int} height - Height of the array

 * @return {String} - A base64 URL of the array
*/
function dataToBase64(data, width, height) {
    const canvas = document.createElement('canvas'),
        pixel_size = 1,
        context = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    const canvas_data = context.getImageData(0, 0, width, height),
        _data = canvas_data.data

    let color
    for (let i = 0, l = _data.length; i < l; i += 4) {
        color = data[i / 4];
        _data[i] = color,
            _data[i + 1] = color,
            _data[i + 2] = color,
            _data[i + 3] = 255;
    }

    context.putImageData(canvas_data, 0, 0);
    return canvas.toDataURL() //return base64 string
}

/**
 * Function that transform an base64 encoded URL into an image
 *
 * @param {String} data - Base64 encoded URL
 * @param {Int} width - Width of the array
 * @param {Int} height - Height of the array
 *
 * @returns {HTMLelement} - The image HTML element with the newly created image
*/
function createImage(data, width, height) {
    const base64_imageURL = dataToBase64(data, width, height)

    const img = document.createElement('img')
    img.src = base64_imageURL
    img.width = 280
    img.height = 280

    return img
}

/**
 * Function that modify the main container content
 *
 * @param {String} mode - The mode of action to do : empty | append
 * @param {HTMLel} el - The HTML element to append to the main container
 *
 * @returns {void}
*/
function modifyMainContainer(mode, el) {
    if (mode == 'empty') {
        main_container.innerHTML = ''
    } else if (mode == 'append') {
        main_container.appendChild(el)
    }
}

function displayPrediction(data, width, height, y_pred) {
    modifyMainContainer('empty')

    // Creates an empty div and gives it an id
    pred_div = document.createElement('div')
    pred_div.id = 'pred_div'

    // Create the image
    const img_el = createImage(data, width, height)
    img_el.classList += 'mb-3'
    pred_div.appendChild(img_el)

    // Create the user response form
    const form = document.createElement('form')
    form.id = 'user_prediction_form'
    form.innerHTML = `
        <p>Does the image represents : ${y_pred} ?</p>
        <div>
            <input type="radio" id="pred_is_correct" name="user_prediction" value="1" class="form-check-input">
            <label for="pred_is_correct" class="form-check-label mb-2">✅ This is correct.</label>
        </div>

        <div>
            <input type="radio" id="pred_is_incorrect" name="user_prediction" value="0" class="form-check-input">
            <label for="pred_is_incorrect" class="form-check-label mb-2">❌ This is incorrect.</label>
        </div>

        <div>
            <input type="radio" id="pred_is_unknown" name="user_prediction" value="-1" class="form-check-input">
            <label for="pred_is_unknown" class="form-check-label mb-2">🤷‍♂️ I actually don't know.</label>
        </div>

        <div class="expand mt-2">
            <button id='user_prediction_submit_btn' class="form-control expand">🚀</button>
        </div>
    `
    pred_div.appendChild(form)

    modifyMainContainer('append', pred_div)
}

function handleUserPredForm(history) {
    const user_prediction_submit_btn = document.querySelector('#user_prediction_submit_btn')
    user_prediction_submit_btn.addEventListener('click', e => {
        e.preventDefault()

        const user_prediction_form = document.querySelector('#user_prediction_form'),
            user_prediction_form_data = new FormData(user_prediction_form),
            user_prediction = user_prediction_form_data.get('user_prediction')

        if (!user_prediction) {
            // no user prediction provided
            return
        }

        // update history and add the user prediction
        history.prediction.user_pred = parseInt(user_prediction)

        axios.post('/store', {
            ...history

        }).then(_ => {
            history_id = history['prediction']['id']
            history = JSON.stringify(history)
            localStorage.setItem(history_id, history)


            pred_div.innerHTML = ''

            // Create a restart button and add an event listener to trigger it
            const restart_btn = document.createElement('button')
            restart_btn.textContent = 'Restart prediction'
            restart_btn.className = 'restart_btn btn btn-outline-secondary'
            pred_div.appendChild(restart_btn)

            restart_btn.addEventListener('click', e => {
                e.preventDefault()
                window.location = '/'
            })
        })
    })
}

function handleCanvas() {
    const canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const canvas_x = canvas.offsetLeft,
        canvas_y = canvas.offsetTop
    let last_mouse_x = last_mousey = 0,
        mouse_x = mousey = 0,
        mousedown = false,
        tool_type = 'draw',
        empty_canvas = true

    // Switch draw|erase tool type
    const canvas_switch_tool_btn = document.querySelector('#canvas_switch_tool_btn')
    canvas_switch_tool_btn.addEventListener('click', e => {
        e.preventDefault()

        canvas_switch_tool_btn.value = canvas_switch_tool_btn.value == 'draw' ? 'erase' : 'draw'
        canvas_switch_tool_btn.textContent = canvas_switch_tool_btn.value.charAt(0).toUpperCase() + canvas_switch_tool_btn.value.slice(1)
        tool_type = canvas_switch_tool_btn.value
    })

    console.log(empty_canvas)


    //Mousedown
    canvas.addEventListener('mousedown', e => {
        last_mouse_x = mouse_x = parseInt(e.clientX - canvas_x)
        last_mouse_y = mouse_y = parseInt(e.clientY - canvas_y)
        empty_canvas = false
        mousedown = true
    })

    //Mouseup
    canvas.addEventListener('mouseup', e => {
        mousedown = false;
    });

    //Mousemove
    canvas.addEventListener('mousemove', e => {
        mouse_x = parseInt(e.clientX - canvas_x)
        mouse_y = parseInt(e.clientY - canvas_y)

        if (mousedown) {
            ctx.beginPath()

            if (tool_type == 'draw') {
                ctx.globalCompositeOperation = 'source-over'
                ctx.strokeStyle = '#FFF'
                ctx.lineWidth = 20

            } else {
                //ctx.globalCompositeOperation = 'destination-out'
                ctx.strokeStyle = '#000'
                ctx.lineWidth = 30
            }

            ctx.moveTo(last_mouse_x, last_mouse_y)
            ctx.lineTo(mouse_x, mouse_y)
            ctx.lineJoin = ctx.lineCap = 'round'
            ctx.stroke()
        }

        last_mouse_x = mouse_x
        last_mouse_y = mouse_y
    })

    // Save image as is then init the pred process
    const pred_init_free_drawing_btn = document.querySelector('#pred_init_free_drawing_btn')
    pred_init_free_drawing_btn.addEventListener('click', e => {
        e.preventDefault()

        // Prevent from submitting empty canvas
        if (empty_canvas) return

        // Resize the canvas to 784px
        const resized_canvas = document.createElement('canvas'),
            resized_ctx = resized_canvas.getContext('2d')
        resized_canvas.width = 28
        resized_canvas.height = 28
        resized_ctx.drawImage(canvas, 0, 0, canvas.width * 0.1, canvas.height * 0.1)

        // Get the image data -> return Uint8ClampedArray
        let image_data = resized_ctx.getImageData(0, 0, resized_canvas.width, resized_canvas.height),
            tf_image_data = tf.browser.fromPixels(image_data, 1).arraySync()

        axios.post('/init', {
            'pred_type': 'free_drawing',
            'image_data': tf_image_data

        }).then(res => {
            console.log('Response : ', res.data)

            const pred_div = document.querySelector('#pred_div'),
                form = document.createElement('form'),
                y_pred = res.data.prediction.y_pred

            form.id = 'user_prediction_form'
            form.innerHTML = `
                <p>Does the image represents : ${y_pred} ?</p>
                <div>
                    <input type="radio" id="pred_is_correct" name="user_prediction" value="1" class="form-check-input">
                    <label for="pred_is_correct" class="form-check-label mb-2">✅ This is correct.</label>
                </div>

                <div>
                    <input type="radio" id="pred_is_incorrect" name="user_prediction" value="0" class="form-check-input">
                    <label for="pred_is_incorrect" class="form-check-label mb-2">❌ This is incorrect.</label>
                </div>

                <div>
                    <input type="radio" id="pred_is_unknown" name="user_prediction" value="-1" class="form-check-input">
                    <label for="pred_is_unknown" class="form-check-label mb-2">🤷‍♂️ I actually don't know.</label>
                </div>

                <div class="expand mt-2">
                    <button id='user_prediction_submit_btn' class="form-control expand">🚀</button>
                </div>
            `
            pred_div.appendChild(form)
            modifyMainContainer('append', pred_div)

            handleUserPredForm(res.data)
        })
    })
}

//////////////////////////////////////////////////////
///////////////// UTILS FUNCTION END /////////////////
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
//////////////////// SCRIPT START ////////////////////
//////////////////////////////////////////////////////

const main_container = document.querySelector('.main_container')

// Init prediction for case : random image
const pred_choice_random_image_btn = document.querySelector('#pred_choice_random_image')
pred_choice_random_image_btn.addEventListener('click', e => {
    e.preventDefault()

    axios.post('/init', {
        'pred_type': 'random_image'

    }).then(res => {
        const data = res.data.image.data['1D'];
        ({ width, height } = res.data.image)
        const y_pred = res.data.prediction.y_pred

        displayPrediction(data, width, height, y_pred)
        handleUserPredForm(res.data)
    })
})

// Init prediction for case : free drawing
const pred_choice_draw_btn = document.querySelector('#pred_choice_draw')
pred_choice_draw_btn.addEventListener('click', e => {
    e.preventDefault()

    main_container.innerHTML = ''
    main_container.innerHTML = `<div id="pred_div">
                                    <canvas id="canvas" width="280" height="280"></canvas>
                                    <div id='canvas_btn'>
                                        <button id="canvas_switch_tool_btn" class="btn btn-outline-secondary" value="draw">Draw</button>
                                        <button id="pred_init_free_drawing_btn" class="btn btn-outline-secondary">🚀</button>
                                    </div>
                                </div>`
    handleCanvas()
})

// Link button to access stats page
const stats_btn = document.querySelector('#stats_btn')
stats_btn.addEventListener('click', _ => {
    window.location = '/stats'
})

//////////////////////////////////////////////////////
//////////////////// SCRIPT END //////////////////////
//////////////////////////////////////////////////////
