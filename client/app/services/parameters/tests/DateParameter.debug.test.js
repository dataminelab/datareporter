import moment from 'moment';
import DateParameter from '../DateParameter';

describe('DateParameter Debug', () => {
    let param;

    beforeEach(() => {
        param = new DateParameter({
            name: 'test_date',
            title: 'Test Date',
            type: 'date'
        });
    });

    test('debug datetime-local format', () => {
        param.type = 'datetime-local';
        const validDate = moment('2023-01-01T12:00:00');
        param.setValue(validDate);
        const result = param.getExecutionValue();
        console.log('datetime-local result:', result);
        // This will show us what the actual format is
        expect(typeof result).toBe('string');
    });

    test('debug datetime-with-seconds format', () => {
        param.type = 'datetime-with-seconds';
        const validDate = moment('2023-01-01T12:00:00');
        param.setValue(validDate);
        const result = param.getExecutionValue();
        console.log('datetime-with-seconds result:', result);
        expect(typeof result).toBe('string');
    });

    test('debug normalizeValue with invalid input', () => {
        const testValues = ['', null, undefined, 'not-a-date', 'invalid-format'];

        testValues.forEach(value => {
            const result = param.normalizeValue(value);
            console.log(`normalizeValue('${value}'):`, result, typeof result);
        });

        expect(true).toBe(true); // Always pass, we just want to see the output
    });
});