import { Component, OnInit } from '@angular/core';
import { EgcData } from './egcdata.model';
import { CoinDataService } from '../services/coindata.service';
import { ITokenData } from '../models/tokendata';
import { BscResponse } from '../models/bscresponse';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  egcData: EgcData = {
    totalSupply: 1000000000000000,
    burnedTokens: 514725329117038,
    circulatingSupply: 1000000000000,
    rewardPercent: 0.08,
    dailyVolume: 1000000,
    egcHeld: 5000000000,
  };
  tokenData: ITokenData;
  bscBurnedResult: BscResponse;
  bscWalletEGCHeld: BscResponse;
  walletAddress: string;

  public rewards = 0;

  constructor(private coinDataService: CoinDataService) {
    this.updateCirculatingSupply();
    this.calculateRewards();
  }

  ngOnInit() {
    this.loadLocalStorage();
    //this.getBscBurnData();
    //this.getTokenData();
  }

  getWalletAddressEGCHeld() {
    if (this.walletAddress !== '') {
      this.coinDataService
        .getBscWalletEGCHeld(this.walletAddress)
        .subscribe((data) => {
          this.bscWalletEGCHeld = data;
          const value = parseFloat(data.result);
          if (!isNaN(value)) {
            const decValue = value * 0.000000001;
            this.egcData.egcHeld = decValue;
            this.saveLocalEGCHeld();
            this.calculateRewards();
          }
          //console.log(data);
        });
    }
  }

  getBscBurnData() {
    this.coinDataService.getBscBurnData().subscribe((data) => {
      this.bscBurnedResult = data;
      const value = parseFloat(data.result);
      if (!isNaN(value)) {
        const decValue = value * 0.000000001;
        this.egcData.burnedTokens = decValue;
        this.saveLocalTokensBurned();
      }
      //console.log(data);
    });
  }

  getTokenData() {
    this.coinDataService.getCoinGeckoTokenData().subscribe((data) => {
      this.tokenData = data;
      this.egcData.dailyVolume = this.tokenData.totalVolume;
      this.saveLocalDailyVolume();
      //console.log(data);
    });
  }

  loadLocalStorage() {
    this.loadLocalTokensBurned();
    this.loadLocalDailyVolume();
    this.loadLocalWalletAddress();
    this.loadLocalTokensHeld();
  }

  loadLocalWalletAddress() {
    this.walletAddress = localStorage.getItem('egc_walletAddress');
  }

  loadLocalTokensBurned() {
    const stringValue = localStorage.getItem('egc_tokensBurned');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.egcData.burnedTokens = value;
    }
  }

  loadLocalDailyVolume() {
    const stringValue = localStorage.getItem('egc_dailyVolume');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.egcData.dailyVolume = value;
    }
  }

  loadLocalTokensHeld() {
    const stringValue = localStorage.getItem('egc_tokensHeld');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.egcData.egcHeld = value;
    }
  }

  saveLocalDailyVolume() {
    localStorage.setItem(
      'egc_dailyVolume',
      this.egcData.dailyVolume.toString()
    );
  }

  saveLocalTokensBurned() {
    localStorage.setItem(
      'egc_tokensBurned',
      this.egcData.burnedTokens.toString()
    );
  }

  saveLocalWalletAddress() {
    localStorage.setItem('egc_walletAddress', this.walletAddress);
  }

  saveLocalEGCHeld() {
    localStorage.setItem('egc_tokensHeld', this.egcData.egcHeld.toString());
  }

  updateCirculatingSupply() {
    this.egcData.circulatingSupply =
      this.egcData.totalSupply - this.egcData.burnedTokens;
  }

  calculateRewards() {
    const totalDistribution = this.totalDistribution();
    const effectivePercentage = this.effectivePercentage();
    this.rewards = effectivePercentage * totalDistribution;
  }

  totalDistribution() {
    return this.egcData.dailyVolume * this.egcData.rewardPercent;
  }

  effectivePercentage() {
    return this.egcData.egcHeld / this.egcData.circulatingSupply;
  }

  // onChange Methods
  onChangeTokensBurned(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.egcData.burnedTokens = parsedValue;
      this.updateCirculatingSupply();
      this.calculateRewards();

      // save to local storage
      localStorage.setItem(
        'egc_tokensBurned',
        this.egcData.burnedTokens.toString()
      );
    }
  }

  onChangeDailyVolume(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.egcData.dailyVolume = parsedValue;
      this.calculateRewards();

      // save to local storage
      this.saveLocalDailyVolume();
    }
  }

  onChangeEgcHeld(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.egcData.egcHeld = parsedValue;
      this.calculateRewards();

      // save to local storage
      this.saveLocalEGCHeld();
    }
  }

  onChangeWalletAddress(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.walletAddress = value;
    //this.calculateRewards();

    // save to local storage
    this.saveLocalWalletAddress();
  }
}
