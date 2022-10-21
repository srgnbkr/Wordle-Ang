import { LetterState } from './../../interfaces/letterState';
import { Letter } from './../../interfaces/letter';
import { Try } from './../../interfaces/try';
import { Component, HostListener, OnInit } from '@angular/core';

//Kelimenin uzunluğu
const WORD_LENGTH = 5;
//Deneme sayısı
const NUM_TRIES = 6;

const LETTERS = (() => {
  const ret: { [key: string]: boolean } = {};
  const turkishLetters: string[] = [
    'a',
    'b',
    'c',
    'ç',
    'd',
    'e',
    'f',
    'g',
    'ğ',
    'h',
    'ı',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'r',
    's',
    'ş',
    't',
    'u',
    'v',
    'y',
    'z',
  ];
  turkishLetters.forEach((h) => (ret[h] = true));

  return ret;
})();

@Component({
  selector: 'wordle',
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.scss'],
})
export class WordleComponent implements OnInit {
  readonly tries: Try[] = [];
  infoMessage = '';
  fadeOutInfoMessage = false;

  //Harfin indexini bulur
  private currentLetterIndex = 0;

  private numberSubmitettedTries = 0;

  constructor() {
    for (let i = 0; i < NUM_TRIES; i++) {
      const letters: Letter[] = [];
      for (let j = 0; j < WORD_LENGTH; j++) {
        letters.push({ text: '', state: LetterState.PENDIG });
      }
      this.tries.push({ letters });
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  //Harf girişini kontrol eder
  private handleClickKey(key: string) {
    if (LETTERS[key.toLocaleLowerCase()]) {
      if (
        this.currentLetterIndex <
        (this.numberSubmitettedTries + 1) * WORD_LENGTH
      ) {
        this.setLetter(key);
        this.currentLetterIndex++;
      }
    }
    //Girilen Harfleri Silmek için
    else if (key === 'Backspace') {
      if (this.currentLetterIndex > this.numberSubmitettedTries * WORD_LENGTH) {
        this.currentLetterIndex--;
        this.setLetter('');
      }
    } else if (key === 'Enter') {
      this.checkCurrentTry();
    }
  }

  //Harf girişini yapar
  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.currentLetterIndex / WORD_LENGTH);
    const letterIndex = this.currentLetterIndex - tryIndex * WORD_LENGTH;
    this.tries[tryIndex].letters[letterIndex].text = letter;
  }

  //
  private checkCurrentTry() {
    const currentTry = this.tries[this.numberSubmitettedTries];
    if (currentTry.letters.some((letter) => letter.text === '')) {
      this.showInfoMessage('Lütfen tüm harfleri giriniz');
      return;
    }
  }

  private showInfoMessage(message: string) {
    //TODO: Burayı observable ile yapmayı deneyebilirsin...
    //TODO:Subject mi olmalı yoksa observable mi?
    //TODO: Subject ile yaparsan, herhangi bir componentten mesaj gönderilebilir.
    //TODO: Observable ile yaparsan, sadece bu componentten mesaj gönderilebilir.
    this.infoMessage = message;
    setTimeout(() => {
      this.fadeOutInfoMessage = true;
      setTimeout(() => {
        this.infoMessage = '';
        this.fadeOutInfoMessage = false;
      }, 500);
    }, 2000);
  }

  ngOnInit(): void {}
}
