#include <iostream>

using namespace std;

int getHigh(int num[], int size);
int getLow(int num[], int size);
int getMiddle(int num[], int size);

int main() {
    int sz = 3;
    int num[3];

    for (int i = 0; i < sz; i++) {
        cout << "Enter number " << i + 1 << " : ";
        cin >> num[i];
    }

    int high, low, mid;
    high = getHigh(num, sz);
    low = getLow(num, sz);
    mid = getMiddle(num, sz);

    cout << "Highest: " << high << endl;
    cout << "Lowest: " << low << endl;
    cout << "Middle: " << mid << endl;

    return 0;
}

int getHigh(int arr[], int size) {
    int high = arr[0];
    for (int i = 0; i < size; i++) {
        if (arr[i] > high) {
            high = arr[i];
        }
    }
    return high;
}

int getLow(int arr[], int size) {
    int low = arr[0];
    for (int i = 0; i < size; i++) {
        if (arr[i] < low) {
            low = arr[i];
        }
    }
    return low;
}

int getMiddle(int arr[], int size) {
    int low = getLow(arr, size);
    int high = getHigh(arr, size);
    int result;
    for (int i = 0; i < size; i++) {
        if (arr[i] != high && arr[i] != low) {
            result = arr[i];
        }
    }
    return result;
}
