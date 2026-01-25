#include <fstream>
#include <iostream>
using namespace std;
void border() {
    cout << "------------------------------\n";
}
int n = 0;
string name[100];
int grade[100];

void menu(){
    border();
    cout << "\t\t\tMenu\n";
    border();
    cout << "1. Add data to file\n";
    cout << "2. View data from file\n";
    cout << "3. Append data from file\n";
    cout << "4. Exit\n";
}
void addData() {
    n = 0;
    ofstream file;
    file.open("file.txt");
    if (!file) {
        cout << "Error creating file!" << endl;
    }
    border();
    cout << "Enter name of student: ";
    cin >> name[n];
    cout << "Enter grade of student: ";
    cin >> grade[n];
    file << "Name: "<< name[n] << "\nGrade: " << grade[n] << endl;
    file.close();
    n+=1;
}
void viewData() { string line;
    ifstream file("file.txt");
    border();
    while (getline(file, line)) {
        cout << line << endl;
    }
    file.close();
}
void appendData() {
    ofstream file("file.txt", ios::app);
    if (!file) {
        cout << "Cannot open file.\n";
        return;
    }
    border();
    string name, grade;
    cout << "Enter name: ";
    cin.ignore();
    getline(cin, name);

    cout << "Enter grade: ";
    cin >> grade;

    file << "Name: " << name << "\nGrade: " << grade << "\n\n";

    file.close();
}
void exitProgram() {
    cout << "Exiting...\n";
}

bool getOpt() {
    int opt;
    bool cond = true;
    border();
    cout << "Enter Option: ";
    cin >> opt;
    switch (opt) {
        case 1: addData();break;
        case 2: viewData();break;
        case 3: appendData();break;
            case 4: cond = false;break;
            default: cout << "Invalid Option!\n";
    }
    return cond;
}

int main() {
    do {
        menu();
        getOpt();
    }while(getOpt ());
    exitProgram();
    return 0;
}
