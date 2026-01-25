#include <iostream>

using namespace std;
int main() {
    int arr[] = {100,200,300,400,500};
    char opt;

    do {
        bool numfi = false;
        cout<< "Enter value to search: ";
        int num = 0; cin>>num;

        for (int i = 0; i <= 4; i++) {
            if (arr[i] == num) {
                cout << num << " is found" << endl;
                numfi = true;
                break;
            }
        }
        if (numfi != true) {
            cout << num << " is not found." << endl;
            }

        cout << "Try again?[y/n]: ";
        cin >> opt;
        if (opt == 'n' || opt == 'N') {
            break;
        }


    }while (opt != 'n' || opt != 'N');

    return 0;
}