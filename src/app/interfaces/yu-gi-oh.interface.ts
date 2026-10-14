/** Imagen de una carta de Yu-Gi-Oh! (db.ygoprodeck.com) */
export interface YugiohCardImage {
  id: number;
  image_url: string;
  image_url_small: string;
}

/** Carta de Yu-Gi-Oh! */
export interface YugiohCard {
  id: number;
  name: string;
  type: string;
  humanReadableCardType?: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  card_images: YugiohCardImage[];
}

/** Respuesta de cardinfo.php */
export interface YugiohResponse {
  data: YugiohCard[];
}
