import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Board } from "../types";
import { initialBoards, defaultBoardCards } from "../data/initialData";

export function useBoardInitialization(): number {
  const [boardsList] = useLocalStorage<Board[]>("crm_boards", initialBoards);

  useEffect(() => {
    boardsList.forEach((board) => {
      const isDefaultBoard = initialBoards.some((b) => b.id === board.id);
      const key = `kanban_cards_${board.id}`;
      const existing = localStorage.getItem(key);
      if (!existing && isDefaultBoard) {
        localStorage.setItem(key, JSON.stringify(defaultBoardCards));
      }
    });
  }, [boardsList]);

  return boardsList.length;
}
