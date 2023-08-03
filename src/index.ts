import { NetworkName } from "@aptos-labs/wallet-adapter-core";
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { TxnBuilderTypes, Types } from "aptos";
import { IWeb3Provider } from "@fewcha/web3";

const parseError = (code: number) => {
  let error = "";
  switch (code) {
    case 200:
      break;

    case 401:
      error = "User rejected the request";
      break;

    case 403:
      error = "Please connect wallet";
      break;

    case 500:
      error = "Unknown error";
      break;

    default:
      error = "Unknown error";
  }

  if (error) throw new Error(error);
};

// CHANGE AptosWindow
interface FewchaWindow extends Window {
  fewcha?: IWeb3Provider; // CHANGE aptos key
}

declare const window: FewchaWindow; // CHANGE AptosWindow

export const FewchaWalletName = "Fewcha" as WalletName<"Fewcha">; // CHANGE FewchaWalletName, CHANGE "Aptos"

// CHANGE FewchaWallet
export class FewchaWallet implements AdapterPlugin {
  readonly name = FewchaWalletName;

  readonly url =
    "https://chrome.google.com/webstore/detail/fewcha-move-wallet/ebfidpplhabeedpnhjnobghokpiioolj";

  readonly icon =
    "data:image/png;base64,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";

  provider: IWeb3Provider | undefined =
    typeof window !== "undefined" ? window.fewcha : undefined;

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) {
        throw `${FewchaWalletName} Address Info Error`;
      }
      parseError(accountInfo.status);

      return accountInfo.data;
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    try {
      const response = await this.provider?.account();
      if (!response) {
        throw `${FewchaWalletName} Account Error`;
      }
      parseError(response.status);

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const response = await this.provider?.disconnect();
      if (!response) {
        throw `${FewchaWalletName} Disconnect Error`;
      }
      parseError(response.status);
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const rawTransaction = await this.provider?.aptos.generateTransaction(
        transaction as Types.EntryFunctionPayload,
        options
      );
      if (!rawTransaction) {
        throw `${FewchaWalletName} Generate Transaction Error`;
      }
      if (rawTransaction.status === 500) {
        throw new Error(rawTransaction.data as unknown as string);
      }

      const response = await this.provider?.aptos.signAndSubmitTransaction(
        rawTransaction.data
      );
      if (!response) {
        throw `${FewchaWalletName} Sign And Submit Transaction Error`;
      }
      if (rawTransaction.status === 500) {
        throw new Error(response.data as unknown as string);
      }

      return { hash: response?.data };
    } catch (error: any) {
      throw error;
    }
  }

  async signTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<Uint8Array | null> {
    try {
      const rawTransaction = await this.provider?.aptos.generateTransaction(
        transaction as Types.EntryFunctionPayload,
        options
      );
      if (!rawTransaction) {
        throw `${FewchaWalletName} Generate Transaction Error`;
      }
      if (rawTransaction.status === 500) {
        throw new Error(rawTransaction.data as unknown as string);
      }

      const response = await this.provider?.aptos.signTransaction(
        rawTransaction.data
      );
      if (!response) {
        throw `${FewchaWalletName} Sign And Submit Transaction Error`;
      }
      if (rawTransaction.status === 500) {
        throw new Error(response.data as unknown as string);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitBCSTransaction(
    _transaction: TxnBuilderTypes.TransactionPayload,
    _options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    // TODO: support signAndSubmitBCSTransaction in web3SDK
    throw "not supported yet";
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${FewchaWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.aptos.signMessage(message);
      if (!response) {
        throw `${FewchaWalletName} Sign Message Error`;
      }
      parseError(response.status);

      return response.data as SignMessageResponse;
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.getNetwork();
      if (!response) {
        throw `${FewchaWalletName} Network Error`;
      }
      parseError(response.status);

      return {
        name: response.data as NetworkName,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      const handleNetworkChange = async (): Promise<void> => {
        const response = await this.network();
        callback({
          name: response.name,
          chainId: undefined,
          api: undefined,
        });
      };

      await (this.provider as any)?.onChangeNetwork(handleNetworkChange);
    } catch (error: any) {
      throw error;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      const handleAccountChange = async (): Promise<void> => {
        const response = await this.connect();
        callback({
          address: response?.address,
          publicKey: response?.publicKey,
        });
      };
      await (this.provider as any)?.onChangeAccount(handleAccountChange);
    } catch (error: any) {
      throw error;
    }
  }
}
