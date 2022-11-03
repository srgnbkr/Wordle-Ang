import { LetterState } from './../../interfaces/letterState';
import { Letter } from './../../interfaces/letter';
import { Try } from './../../interfaces/try';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { WORDS } from '../../constants/words';

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
    'ö',
    'p',
    'r',
    's',
    'ş',
    't',
    'u',
    'ü',
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
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;

  readonly tries: Try[] = [];
  readonly LetterState = LetterState;

  readonly keyboardKeys = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Enter', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'Backspace'],
  ];

  readonly currentLetterStates: { [key: string]: LetterState } = {};

  private targetWordLettersCounts: { [letter: string]: number } = {};
  infoMessage = '';
  fadeOutInfoMessage = false;

  private targetWord = '';

  //True ise oyunu kazandı bitti. değilse devam et...
  private won = false;

  //Harfin indexini bulur
  private currentLetterIndex = 0;

  private numberSubmitettedTries = 0;

  //TODO:Componentlere ayırarak tekrar dene. Keyboard ayrı, wordle ayrı. Json-serverden kelimeleri çekebiliriz.
  constructor() {
    for (let i = 0; i < NUM_TRIES; i++) {
      const letters: Letter[] = [];
      for (let j = 0; j < WORD_LENGTH; j++) {
        letters.push({ text: '', state: LetterState.PENDIG });
      }
      this.tries.push({ letters });
    }

    const numberWords = WORDS.length;
    //TODO:Random kelime seçmemizi sağlayacak
    while (true) {
      const index = Math.floor(Math.random() * numberWords);
      const word = WORDS[index];
      if (word.length === WORD_LENGTH) {
        this.targetWord = word.toLocaleLowerCase();
        break;
      }
    }
    console.log('targetWord', this.targetWord);

    for (const letter of this.targetWord) {
      const count = this.targetWordLettersCounts[letter];
      if (count == null) {
        this.targetWordLettersCounts[letter] = 0;
      }
      this.targetWordLettersCounts[letter]++;
    }
    console.log(this.targetWordLettersCounts);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  //Girilen kelimede harf tutuyorsa klavyede yeşil,yeri yanlışşsa sarı, hiçbiri değilse gri renk verir
  getKeyClass(key: string): string {
    const state = this.currentLetterStates[key.toLocaleLowerCase()];

    switch (state) {
      case LetterState.FULL_MATCH:
        return 'match key';
      case LetterState.PARTIAL_MATCH:
        return 'partial key';
      case LetterState.WRONG:
        return 'wrong key';
      default:
        return 'key';
    }
  }

  //Harf girişini kontrol eder
 handleClickKey(key: string) {
    if (this.won) {
      return;
    }

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

  //TODO:Devamı gelecek...
  private async checkCurrentTry() {
    const currentTry = this.tries[this.numberSubmitettedTries];
    if (currentTry.letters.some((letter) => letter.text === '')) {
      this.showInfoMessage('Lütfen tüm harfleri giriniz');
      return;
    }
    const wordFromCurrentTry = currentTry.letters
      .map((letter) => letter.text)
      .join('')
      .toLocaleUpperCase();
    console.log('wordFromCurrentTry', wordFromCurrentTry);

    if (!WORDS.includes(wordFromCurrentTry)) {
      this.showInfoMessage('Kelieme bulunamadı');
      //Geçerli olmayan bir kelime girilirse kutular sallanır.
      const tryContainer = this.tryContainers.get(this.numberSubmitettedTries)
        ?.nativeElement as HTMLElement;
      tryContainer.classList.add('shake');
      setTimeout(() => {
        tryContainer.classList.remove('shake');
      }, 500);
      return;
    }

    const targetWordLettersCounts = { ...this.targetWordLettersCounts };
    const states: LetterState[] = [];

    for (let i = 0; i < WORD_LENGTH; i++) {
      const expected = this.targetWord[i];
      const currentLetter = currentTry.letters[i];
      const got = currentLetter.text.toLocaleLowerCase();
      let state = LetterState.WRONG;
      if (expected === got && targetWordLettersCounts[got] > 0) {
        targetWordLettersCounts[expected]--;
        state = LetterState.FULL_MATCH;
      } else if (
        this.targetWord.includes(got) &&
        targetWordLettersCounts[got] > 0
      ) {
        targetWordLettersCounts[got]--;
        state = LetterState.PARTIAL_MATCH;
      }

      states.push(state);
    }
    console.log(states);

    const tryContainer = this.tryContainers.get(this.numberSubmitettedTries)
      ?.nativeElement as HTMLElement;

    const letterElements = tryContainer.querySelectorAll('.letter-container');

    for (let i = 0; i < letterElements.length; i++) {
      const currentLetterElements = letterElements[i];
      currentLetterElements.classList.add('fold');
      await this.wait(180);
      currentTry.letters[i].state = states[i];
      currentLetterElements.classList.remove('fold');
      await this.wait(180);
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      const curLetter = currentTry.letters[i];
      const got = curLetter.text.toLocaleLowerCase();
      const curStoredState = this.currentLetterStates[got];
      const targetState = states[i];

      if (curStoredState == null || targetState > curStoredState) {
        this.currentLetterStates[got] = targetState;
      }
    }

    this.numberSubmitettedTries++;

    //Kelimeyi bulmuşşsa harfler zıplar ve mesaj verir...
    if (states.every((state) => state === LetterState.FULL_MATCH)) {
      this.showInfoMessage('Tebrikler Kelimeyi Buldunuz');
      this.won = true;

      //Bounce animation
      for (let i = 0; i < letterElements.length; i++) {
        const currentLetterElement = letterElements[i];
        currentLetterElement.classList.add('bounce');
        await this.wait(160);
      }
      return;
    }

    //Hakkını bitirmişşse kelimeyi gösterir...
    if (this.numberSubmitettedTries === NUM_TRIES) {
      this.showInfoMessage(this.targetWord.toLocaleUpperCase(), false);
      return;
    }
  }

  private showInfoMessage(message: string, hide = true) {
    //TODO: Burayı observable ile yapmayı deneyebilirsin...
    //TODO:Subject mi olmalı yoksa observable mi?
    //TODO: Subject ile yaparsan, herhangi bir componentten mesaj gönderilebilir.
    //TODO: Observable ile yaparsan, sadece bu componentten mesaj gönderilebilir.
    this.infoMessage = message;
    if (hide) {
      setTimeout(() => {
        this.fadeOutInfoMessage = true;
        setTimeout(() => {
          this.infoMessage = '';
          this.fadeOutInfoMessage = false;
        }, 500);
      }, 2000);
    }
  }

  private async wait(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, ms)
    );
  }

  ngOnInit(): void {}
}
