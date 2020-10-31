const express = require('express')
const { v4: uuid, validate } = require('uuid');

const app = express()

app.use(express.json())



// variavel para simular um banco de dados (perde os dados quando reiniciar o servidor)
const projects = []

// middleware
function logRequests(request, response, next){

    const { method, url } = request

    const logLabel = `[${method.toUpperCase()}] ${url}`

    console.time(logLabel) // inicia o timer para medir tempo da requisicao
    next() // chama a proxima etapa (libera o codigo para executar a rota)
    console.timeEnd(logLabel) // finaliza o timer e apresenta os dados no console (mostra a variavel e o tempo que levou para executar)

}

function validateProjectId(request, response, next) {

    const { id } = request.params

    if(!validate(id)) {
        return response.status(400).json({ error: 'Invalid project ID.' })
    }

    return next()

}



// usa o middleware em todas as rotas
app.use(logRequests)
// usa o middleware apenas nas rotas que tiverem "/projects/:id"
app.use('/projects/:id', validateProjectId)



app.get('/projects', (request, response) => {

    const { title } = request.query

    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects

    return response.json(results)

})

app.post('/projects', (request, response) => {

    const { title, owner } = request.body

    const project = {
        id: uuid(),
        title,
        owner,
    }

    projects.push(project)

    return response.json(project)

})

app.put('/projects/:id', (request, response) => {

    const { id } = request.params
    const { title, owner } = request.body

    const projectIndex = projects.findIndex(project => project.id == id)

    if(projectIndex < 0) {
        return response.status(400).json({ error: "Project not found."})
    }

    const project = {
        id,
        title,
        owner,
    }

    projects[projectIndex] = project

    return response.json(project)

})

app.delete('/projects/:id', (request, response) => {

    const { id } = request.params

    const projectIndex = projects.findIndex(project => project.id == id)

    if(projectIndex < 0) {
        return response.status(400).json({ error: "Project not found."})
    }

    projects.splice(projectIndex, 1)

    return response.status(204).send()

})



app.listen(3333, () => {
    console.log('Servidor Online!')
})