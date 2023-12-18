export const responseFormatter = (response: any[][]): any[][] => {
    return response.map(query => query.map(value => value.split('\n').join(' ').trim()));
};
