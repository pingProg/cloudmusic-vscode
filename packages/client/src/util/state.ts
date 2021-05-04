import { AccountManager, ButtonManager } from "../manager";
import { IPCClient, apiCache } from ".";
import { PlaylistProvider, QueueItemTreeItem } from "../treeview";
import type { QueueContent } from "../treeview";
import { apiUserLevel } from "../api";
import { commands } from "vscode";
import i18n from "../i18n";
import { unplayable } from "../constant";

export const enum LikeState {
  none = -1,
  like = 1,
  dislike = 0,
}

export class State {
  private static _playItem?: QueueContent;

  static get playItem(): QueueContent | undefined {
    return State._playItem;
  }

  static set playItem(value: QueueContent | undefined) {
    if (value !== this._playItem) {
      this._playItem = value;
      if (value) void IPCClient.load();
      else IPCClient.stop();
    }
  }

  private static _like = LikeState.none;

  static get like(): LikeState {
    return this._like;
  }

  static set like(newValue: LikeState) {
    if (newValue !== this._like) {
      this._like = newValue;
      ButtonManager.buttonLike(newValue);
    }
  }

  private static _loading = false;

  static get loading(): boolean {
    return this._loading;
  }

  static set loading(value: boolean) {
    if (value !== this._loading) {
      this._loading = value;
      if (value)
        ButtonManager.buttonSong(
          `$(loading~spin) ${i18n.word.song}: ${i18n.word.loading}`
        );
      else if (this._playItem) {
        const { name, ar, id } = this._playItem.item;
        ButtonManager.buttonSong(name, ar.map(({ name }) => name).join("/"));
        this.like =
          this._playItem instanceof QueueItemTreeItem && !unplayable.has(id)
            ? AccountManager.likelist.has(id)
              ? LikeState.like
              : LikeState.dislike
            : LikeState.none;
      }
    }
  }

  private static _login = false;

  static get login(): boolean {
    return this._login;
  }

  static set login(value: boolean) {
    if (value !== this._login) {
      this._login = value;
      apiCache.flushAll();
      PlaylistProvider.refresh();
      // RadioProvider.refresh();
      if (value) {
        void apiUserLevel();
        ButtonManager.buttonAccount(AccountManager.nickname);
        ButtonManager.show();
        /* void apiRecommendSongs().then((songs) =>
          QueueProvider.refresh(() => {
            QueueProvider.clear();
            QueueProvider.add(
              songs.map((song) => new QueueItemTreeItem(song, 0))
            );
          })
        ); */
      } else {
        ButtonManager.hide();
        void commands.executeCommand("cloudmusic.clearQueue");
      }
    }
  }
}

/* export class PersonalFm {
  private static item: QueueItemTreeItem[] = [];

  private static _state = false;

  static get state(): boolean {
    return this._state;
  }

  static set state(newValue: boolean) {
    if (newValue !== this._state) {
      this._state = newValue;
      ButtonManager.buttonPrevious(newValue);
      if (newValue) void this.next().then(load);
    }
  }

  static async head(): Promise<QueueItemTreeItem> {
    if (this.item.length === 0) {
      const songs = await apiPersonalFm();
      this.item = songs.map((song) => new QueueItemTreeItem(song, 0));
    }

    return this.item.splice(0, 1)[0];
  }

  static async next(): Promise<QueueItemTreeItem> {
    if (this.item.length <= 1) {
      const songs = await apiPersonalFm();
      this.item.push(...songs.map((song) => new QueueItemTreeItem(song, 0)));
    }

    return this.item[1];
  }
} */