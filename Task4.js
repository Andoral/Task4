const crypto = require('crypto');
const readlineSync = require('readline-sync');
const AsciiTable = require('ascii-table');

class Move{
	constructor(index, name){
		this.name = name;
		this.index = index + 1;
	}
	IsWinner(moves, opponent)
	{
		return this.FindDefeatedMoves(moves,opponent);	
	}
	FindDefeatedMoves(moves, opponent)
	{
		if (this.index == opponent.index) return 'Tie';
		var x = this.index - Math.floor(moves.length / 2);
		if(x <= 0) x += moves.length;
		if(x > this.index) var defeatedMoves = moves
			.slice(0, this.index - 1)
			.concat(moves.slice(x - 1));
		else var defeatedMoves = moves.slice(x - 1, this.index - 1);
		if(defeatedMoves.includes(String(opponent.name))) return 'Win';
		else return 'Lose';
	}
}

class Table{
	constructor(title, values)
	{
		this.title = title;
		this.heading = [''].concat(values);
		this.rows = new Array(values.length);
		this.FillRows(values);		
	}
	FillRows(values)
	{
		for(let i = 0; i < this.rows.length; i++)
		{
			this.rows[i] = new Array(values.length + 1)
			for (let j = 0; j < this.rows[i].length; j++)
			{
				if(j == 0) this.rows[i][j] = values[i];
				else this.rows[i][j] = new Move(j-1, values[j-1]).
					IsWinner(values, new Move(i, values[i]));				
			}
		}
	}
	ShowTable()
	{
		var table = new AsciiTable(this.title);
		table.setHeading(this.heading);
		this.rows.forEach(element => table.addRow(element));		
  		console.log(table.toString());
	}
}

class HMAC{
	constructor(key, moveValue, algorithm)
	{
		this.algorithm = algorithm;
		const hash = crypto.createHmac(algorithm, key)
		.update(moveValue)
		.digest('hex');
		this.value = hash;
	}
}

function GenerateKey()
{
	const size = 32;
	return crypto.randomBytes(size).toString('hex');
}

function CreateMenu(values)
{
	console.log('Available moves');
	values.forEach(ShowMenu);
	console.log('0 - exit\n? - help');
}

function ShowMenu(element, index, array)
{
	console.log(index + 1, '-', element);
}

function FindInputException(input)
{
	if(input.length <= 1) return 1;
	if(input.length % 2 == 0) return 2;
	if(input.length != [...new Set(input)].length) return 3;
	return 0;
}

function ShowExceptionMessage(input)
{
	switch (FindInputException(input)) {
		case 1:
		 return "Enter the names of the moves. They must not be repeated and the number must be odd(beggining from 3).\nExample: 1 2 3";
		 break;
		case 2:
		 return "Invalid input. The number of moves must be odd.\nExample: 1 2 3 4 5";
		 break;
		case 3:
		 return "Invalid input. Moves must be different from each other\nExample: Rock Paper Scissors Lizard Spock";
		 break;
		default:
		 break;
	}
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMove(min, max, values)
{
	r = getRandom(min, max);
	return new Move(r, values[r]);
}

function DoAction(answer, values, computerMove)
{
	if((Math.round(answer) == answer) &&
		answer > 0 &&
		answer <= values.length){
		a = new Move(answer-1, values[answer-1]);	
		console.log(a.IsWinner(values, computerMove));
		console.log('Your move:', a.name);	
	}
	else if(answer == 0) return;
	else if(answer == '?')
	{
		new Table('', values).ShowTable();
		DoAction(InputAnswer(), values, computerMove);
	}
	else console.log('Invalid input.'); 	
}

function InputAnswer()
{
	return readlineSync.question();
}

function CreateGame(input)
{
	if(FindInputException(input) > 0) 
		console.log(ShowExceptionMessage(input));
	else
	{
		var computerMove = getRandomMove(0, input.length - 1, input);
		var key = GenerateKey();
		console.log('HMAC =',new HMAC(key, computerMove.name, 'sha256').value);
		CreateMenu(input);
 	 	DoAction(InputAnswer(), input, computerMove);
 	 	console.log('Computer move:', computerMove.name,'\nHMAC key =', key);
	}	
}

CreateGame(process.argv.slice(2));

