import { LetterState } from './../../interfaces/letterState';
import { Letter } from './../../interfaces/letter';
import { Try } from './../../interfaces/try';
import { Component, OnInit } from '@angular/core';

//Kelimenin uzunluğu
const WORD_LENGTH = 5
//Deneme sayısı
const NUM_TRIES=6;;

@Component({
  selector: 'wordle',
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.scss']
})
export class WordleComponent implements OnInit {

  readonly tries:Try[]=[];

  constructor()
  {
    for(let i = 0; i < NUM_TRIES; i++){
      const letters:Letter[] = [];
      for(let j =0; j < WORD_LENGTH; j++){
        letters.push({text:'',state:LetterState.PENDIG});;
      }
      this.tries.push({letters});
    }
  }

  ngOnInit(): void {
  }





}
