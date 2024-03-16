export const responseFormatter = (response: any[][]): any[][] => {
    return response.map(query => query.map(value => {
        if (typeof value === 'object') {
            value = value.query
        }
        return value.split('\n').join(' ').trim()
    }));
};
