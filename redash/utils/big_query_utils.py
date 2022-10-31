ONE_BYTE_OF_TERRABYTE = 1e-12
PRICE_PER_TB = 5  # $


def get_price_for_query(data_scanned: float) -> float:
    if data_scanned == 0:
        return 0

    value = data_scanned * ONE_BYTE_OF_TERRABYTE * 5
    return round(value, 6)
