# Conway's Game of Life

#### Live Cell `*`
#### Dead Cell `.`
#### Database: SQLite3

* GET http://localhost:8080/grids/1/after?age=4,1,2
```
{
    "id": 1,
    "x": 3,
    "y": 3,
    "data": [
        {
            "age": 1,
            "grid": "..*..*.**"
        },
        {
            "age": 2,
            "grid": ".....*.**"
        },
        {
            "age": 4,
            "grid": "....**.**"
        }
    ]
}
```
* GET http://localhost:8080/grids/4
* POST http://localhost:8080/grids
```
{
	"x": 3,
	"y": 4,
	"data": "*.**.**.**.*"
}
```
* PATCH http://localhost:8080/grids/5
```
{
	"x": 4,
	"y": 4,
	"data": "*.**.**.**.***.*"
}
```

## Code Run
1. git clone
2. cd Conways-Game-of-Life
3. npm install
4. npm start